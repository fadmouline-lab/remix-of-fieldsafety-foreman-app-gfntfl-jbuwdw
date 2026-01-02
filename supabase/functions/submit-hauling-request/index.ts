
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Authenticate and fetch employee
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('id, org_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (employeeError || !employee) {
      throw new Error('Employee record not found');
    }

    const org_id = employee.org_id;
    const submitted_by_employee_id = employee.id;

    // Parse request body
    const body = await req.json();
    const { project_id, project_address, hauling_company_id, add_dumpsters = [], replace_dumpsters = [] } = body;

    if (!project_id || !hauling_company_id) {
      throw new Error('Missing required fields: project_id or hauling_company_id');
    }

    // Fetch project and hauling company details
    const { data: project } = await supabaseClient
      .from('projects')
      .select('name')
      .eq('id', project_id)
      .single();

    const { data: haulingCompany } = await supabaseClient
      .from('hauling_companies')
      .select('name, phone_number, email, contact_name')
      .eq('id', hauling_company_id)
      .single();

    // Build request_payload for backward compatibility
    const request_payload = {
      add: add_dumpsters.map((d: any) => ({
        dumpster_type: d.dumpster_type,
        quantity: d.quantity,
      })),
      replace: replace_dumpsters.map((d: any) => ({
        dumpster_type: d.dumpster_type,
        quantity: d.quantity,
      })),
    };

    // Insert parent hauling_requests row
    const { data: haulingRequest, error: insertError } = await supabaseClient
      .from('hauling_requests')
      .insert({
        org_id,
        project_id,
        submitted_by_employee_id,
        submitted_time: new Date().toISOString(),
        project_address,
        request_payload,
        status: 'pending',
        revision: 1,
        hauling_company_id,
      })
      .select()
      .single();

    if (insertError || !haulingRequest) {
      throw new Error(`Failed to insert hauling request: ${insertError?.message}`);
    }

    // Insert child hauling_request_items rows
    const itemsToInsert = [];

    for (const item of add_dumpsters) {
      if (item.quantity > 0) {
        const quantity_total = item.quantity;
        const quantity_extra_work = item.extra_work_quantity || 0;
        const quantity_normal_work = quantity_total - quantity_extra_work;

        itemsToInsert.push({
          hauling_request_id: haulingRequest.id,
          org_id,
          project_id,
          dumpster_type: item.dumpster_type,
          quantity_total,
          quantity_extra_work,
          quantity_normal_work,
        });
      }
    }

    for (const item of replace_dumpsters) {
      if (item.quantity > 0) {
        const quantity_total = item.quantity;
        const quantity_extra_work = item.extra_work_quantity || 0;
        const quantity_normal_work = quantity_total - quantity_extra_work;

        itemsToInsert.push({
          hauling_request_id: haulingRequest.id,
          org_id,
          project_id,
          dumpster_type: item.dumpster_type,
          quantity_total,
          quantity_extra_work,
          quantity_normal_work,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabaseClient
        .from('hauling_request_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error(`Failed to insert hauling request items: ${itemsError.message}`);
      }
    }

    // Trigger N8N webhook
    const webhookUrl = Deno.env.get('N8N_HAULING_WEBHOOK_URL');
    let webhookSuccess = false;

    if (webhookUrl) {
      try {
        const webhookPayload = {
          hauling_request_id: haulingRequest.id,
          project_name: project?.name || 'Unknown Project',
          project_address,
          submitting_user_name: `${employee.first_name} ${employee.last_name}`,
          submission_timestamp: haulingRequest.submitted_time,
          request_payload,
          hauling_company_id,
          hauling_company_name: haulingCompany?.name || '',
          hauling_company_phone_number: haulingCompany?.phone_number || '',
          hauling_company_email: haulingCompany?.email || '',
          hauling_company_contact_name: haulingCompany?.contact_name || '',
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        webhookSuccess = webhookResponse.ok;
      } catch (webhookError) {
        console.error('Webhook failed:', webhookError);
      }
    }

    // Update status based on webhook result
    const finalStatus = webhookSuccess ? 'sent' : 'failed';
    await supabaseClient
      .from('hauling_requests')
      .update({ status: finalStatus })
      .eq('id', haulingRequest.id);

    return new Response(
      JSON.stringify({
        success: true,
        hauling_request_id: haulingRequest.id,
        status: finalStatus,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
