
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
      { global: { headers: { Authorization: authHeader } } }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch employee record from authenticated user
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (employeeError || !employee) {
      throw new Error('Employee record not found for authenticated user');
    }

    // Parse request body
    const { project_id, project_address, hauling_company_id, add_dumpsters, replace_dumpsters } = await req.json();

    // Validate required fields
    if (!project_id || !project_address || !hauling_company_id) {
      throw new Error('Missing required fields: project_id, project_address, or hauling_company_id');
    }

    // Default to empty arrays if missing
    const addDumpsters = add_dumpsters || [];
    const replaceDumpsters = replace_dumpsters || [];

    // Fetch project name
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('name')
      .eq('id', project_id)
      .single();

    if (projectError) {
      throw new Error('Project not found');
    }

    // Fetch hauling company details
    const { data: haulingCompany, error: companyError } = await supabaseClient
      .from('hauling_companies')
      .select('*')
      .eq('id', hauling_company_id)
      .single();

    if (companyError) {
      throw new Error('Hauling company not found');
    }

    // Insert parent hauling_requests row
    const { data: haulingRequest, error: haulingRequestError } = await supabaseClient
      .from('hauling_requests')
      .insert({
        org_id: employee.org_id,
        project_id: project_id,
        submitted_by_employee_id: employee.id,
        submitted_time: new Date().toISOString(),
        project_address: project_address,
        request_payload: { add: addDumpsters, replace: replaceDumpsters },
        status: 'pending',
        hauling_company_id: hauling_company_id,
        revision: 1,
      })
      .select('*')
      .single();

    if (haulingRequestError) {
      throw new Error(`Failed to create hauling request: ${haulingRequestError.message}`);
    }

    // Insert child hauling_request_items rows
    const itemsToInsert = [];

    for (const dumpster of addDumpsters) {
      if (dumpster.quantity > 0) {
        itemsToInsert.push({
          hauling_request_id: haulingRequest.id,
          org_id: employee.org_id,
          project_id: project_id,
          dumpster_type: dumpster.dumpster_type,
          quantity_total: dumpster.quantity,
          quantity_extra_work: dumpster.extra_work_quantity || 0,
          // Do NOT set quantity_normal_work - trigger will compute it
        });
      }
    }

    for (const dumpster of replaceDumpsters) {
      if (dumpster.quantity > 0) {
        itemsToInsert.push({
          hauling_request_id: haulingRequest.id,
          org_id: employee.org_id,
          project_id: project_id,
          dumpster_type: dumpster.dumpster_type,
          quantity_total: dumpster.quantity,
          quantity_extra_work: dumpster.extra_work_quantity || 0,
          // Do NOT set quantity_normal_work - trigger will compute it
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabaseClient
        .from('hauling_request_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error(`Failed to create hauling request items: ${itemsError.message}`);
      }
    }

    // Call N8N webhook
    const n8nUrl = Deno.env.get('N8N_HAULING_WEBHOOK_URL');
    let webhookSuccess = false;

    if (n8nUrl) {
      try {
        const n8nResponse = await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hauling_request_id: haulingRequest.id,
            project_name: project.name,
            project_address: project_address,
            submitting_user_name: `${employee.first_name} ${employee.last_name}`,
            submission_timestamp: haulingRequest.submitted_time,
            request_payload: haulingRequest.request_payload,
            hauling_company_id: haulingCompany.id,
            hauling_company_name: haulingCompany.name,
            hauling_company_phone_number: haulingCompany.phone_number,
            hauling_company_email: haulingCompany.email,
            hauling_company_contact_name: haulingCompany.contact_name,
          }),
        });

        webhookSuccess = n8nResponse.ok;
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        webhookSuccess = false;
      }
    }

    // Update status based on webhook result
    const finalStatus = webhookSuccess ? 'sent' : 'failed';
    await supabaseClient
      .from('hauling_requests')
      .update({ status: finalStatus })
      .eq('id', haulingRequest.id);

    return new Response(
      JSON.stringify({ success: true, hauling_request_id: haulingRequest.id, status: finalStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
