
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const payload = await req.json()

    // Lookup org_id from employees table
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('org_id, id')
      .eq('user_id', user.id)
      .single()

    if (empError || !employee) {
      throw new Error('Employee not found')
    }

    // Insert parent injury_reports row
    const { data: injuryReport, error: reportError } = await supabase
      .from('injury_reports')
      .insert({
        org_id: employee.org_id,
        project_id: payload.project_id,
        reported_by_user_id: user.id,
        incident_time: payload.incident_time,
        area_description: payload.area_description,
        was_911_required: payload.was_911_required,
        was_911_called: payload.was_911_called,
        description_text: payload.description_text,
      })
      .select('id')
      .single()

    if (reportError || !injuryReport) {
      throw reportError || new Error('Failed to create injury report')
    }

    const injury_report_id = injuryReport.id

    // Insert photos
    if (payload.photos && payload.photos.length > 0) {
      const photoInserts = payload.photos.map((photo: any) => ({
        injury_report_id,
        org_id: employee.org_id,
        storage_bucket: 'injury-report-photos',
        storage_path: photo.storage_path,
        mime_type: photo.mime_type,
        uploaded_by: user.id,
      }))
      const { error: photoError } = await supabase
        .from('injury_report_photos')
        .insert(photoInserts)
      if (photoError) throw photoError
    }

    // Insert injured employees and capture IDs
    const employeeIdMap = new Map()
    if (payload.injured_employees && payload.injured_employees.length > 0) {
      for (const emp of payload.injured_employees) {
        const { data: insertedEmp, error: empInsertError } = await supabase
          .from('injury_report_employees')
          .insert({
            injury_report_id,
            employee_id: emp.employee_id,
            employee_name: emp.employee_name,
            notes: emp.notes || null,
          })
          .select('id')
          .single()
        if (empInsertError) throw empInsertError
        employeeIdMap.set(emp.employee_id, insertedEmp.id)
      }
    }

    // Insert external workers and capture IDs
    const externalIdMap = new Map()
    if (payload.external_workers && payload.external_workers.length > 0) {
      for (const ext of payload.external_workers) {
        const { data: insertedExt, error: extInsertError } = await supabase
          .from('injury_report_external_workers')
          .insert({
            injury_report_id,
            subcontractor_id: ext.subcontractor_id || null,
            subcontractor_name: ext.subcontractor_name || null,
            person_name: ext.person_name,
            person_phone: ext.person_phone || null,
            person_company: ext.person_company || null,
            notes: ext.notes || null,
          })
          .select('id')
          .single()
        if (extInsertError) throw extInsertError
        externalIdMap.set(ext.temp_id, insertedExt.id)
      }
    }

    // Insert body parts
    if (payload.body_parts && payload.body_parts.length > 0) {
      const bodyPartInserts = payload.body_parts.map((bp: any) => {
        const insert: any = {
          injury_report_id,
          injured_person_type: bp.injured_person_type,
          body_part: bp.body_part,
          injury_type: bp.injury_type || null,
          side: bp.side || null,
          notes: bp.notes || null,
          sketch_storage_path: null,
        }
        if (bp.injured_person_type === 'employee') {
          insert.injured_employee_id = employeeIdMap.get(bp.person_id)
        } else {
          insert.injured_external_id = externalIdMap.get(bp.person_id)
        }
        return insert
      })
      const { error: bpError } = await supabase
        .from('injury_report_body_parts')
        .insert(bodyPartInserts)
      if (bpError) throw bpError
    }

    // Insert first aid
    const { error: firstAidError } = await supabase
      .from('injury_report_first_aid')
      .insert({
        injury_report_id,
        first_aid_provided: payload.first_aid_provided,
      })
    if (firstAidError) throw firstAidError

    // Insert tasks
    if (payload.tasks && payload.tasks.length > 0) {
      const taskInserts = payload.tasks.map((task: any) => ({
        injury_report_id,
        pre_task_card_id: task.pre_task_card_id,
        task_name: task.task_name,
      }))
      const { error: taskError } = await supabase
        .from('injury_report_tasks')
        .insert(taskInserts)
      if (taskError) throw taskError
    }

    // Insert witnesses
    if (payload.witnesses && payload.witnesses.length > 0) {
      const witnessInserts = payload.witnesses.map((wit: any) => ({
        injury_report_id,
        witness_type: wit.witness_type,
        employee_id: wit.witness_type === 'employee' ? wit.employee_id : null,
        witness_name: wit.witness_name,
        witness_phone: wit.witness_phone || null,
        witness_company: wit.witness_company || null,
        statement: wit.statement || null,
      }))
      const { error: witError } = await supabase
        .from('injury_report_witnesses')
        .insert(witnessInserts)
      if (witError) throw witError
    }

    // Insert equipment
    if (payload.equipment && payload.equipment.length > 0) {
      const equipmentInserts = payload.equipment.map((eq: any) => ({
        injury_report_id,
        equipment_id: eq.equipment_id,
        equipment_name: eq.equipment_name,
        notes: eq.notes || null,
        involvement_role: 'involved',
      }))
      const { error: eqError } = await supabase
        .from('injury_report_equipment')
        .insert(equipmentInserts)
      if (eqError) throw eqError
    }

    // Insert materials
    if (payload.materials && payload.materials.length > 0) {
      const materialInserts = payload.materials.map((mat: any) => ({
        injury_report_id,
        material_id: mat.material_id,
        material_name: mat.material_name,
        notes: mat.notes || null,
        involvement_role: 'involved',
      }))
      const { error: matError } = await supabase
        .from('injury_report_materials')
        .insert(materialInserts)
      if (matError) throw matError
    }

    return new Response(
      JSON.stringify({ injury_report_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in submit-injury-report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
