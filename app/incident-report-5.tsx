
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  listItem: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
    marginLeft: 8,
  },
  submitButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default function IncidentReportPage5() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();
  const [loading, setLoading] = useState(false);

  // Parse data from previous pages
  const need911 = params.need911 as string;
  const called911 = params.called911 as string;
  const photos = params.photos ? JSON.parse(params.photos as string) : [];
  
  // Injured employees
  const selectedEmployees = params.selectedEmployees ? JSON.parse(params.selectedEmployees as string) : [];
  const employees = params.employees ? JSON.parse(params.employees as string) : [];
  
  // Subcontractors
  const subcontractorInjured = params.subcontractorInjured as string;
  const subcontractorEntries = params.subcontractors ? JSON.parse(params.subcontractors as string) : [];
  const subcontractorsList = params.subcontractorsList ? JSON.parse(params.subcontractorsList as string) : [];
  
  // Other injured
  const otherInjured = params.otherInjured ? JSON.parse(params.otherInjured as string) : [];
  
  // Incident details
  const incidentTime = params.incidentTime as string;
  const specificArea = params.specificArea as string;
  const selectedTasks = params.selectedTasks ? JSON.parse(params.selectedTasks as string) : [];
  const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];
  const firstAidProvided = params.firstAidProvided as string;
  
  // Witnesses
  const anyWitnesses = params.anyWitnesses as string;
  const witnesses = params.witnesses ? JSON.parse(params.witnesses as string) : [];
  const witnessEmployees = params.witnessEmployees ? JSON.parse(params.witnessEmployees as string) : [];
  
  // Equipment and materials
  const equipmentInvolved = params.equipmentInvolved as string;
  const selectedEquipment = params.selectedEquipment ? JSON.parse(params.selectedEquipment as string) : [];
  const equipmentList = params.equipmentList ? JSON.parse(params.equipmentList as string) : [];
  
  const materialsInvolved = params.materialsInvolved as string;
  const selectedMaterials = params.selectedMaterials ? JSON.parse(params.selectedMaterials as string) : [];
  const materialsList = params.materialsList ? JSON.parse(params.materialsList as string) : [];
  
  const bodyPartDescription = params.bodyPartDescription as string;

  // Mapping functions to resolve IDs to names
  const getEmployeeName = (id: string): string => {
    const employee = employees.find((e: any) => e.id === id);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getTaskName = (id: string): string => {
    const task = tasks.find((t: any) => t.id === id);
    return task ? task.name : 'Unknown Task';
  };

  const getEquipmentName = (id: string): string => {
    const equipment = equipmentList.find((e: any) => e.id === id);
    return equipment ? equipment.name : 'Unknown Equipment';
  };

  const getMaterialName = (id: string): string => {
    const material = materialsList.find((m: any) => m.id === id);
    return material ? material.name : 'Unknown Material';
  };

  const getSubcontractorName = (id: string): string => {
    const subcontractor = subcontractorsList.find((s: any) => s.id === id);
    return subcontractor ? subcontractor.name : 'Unknown Subcontractor';
  };

  const getWitnessEmployeeName = (id: string): string => {
    const employee = witnessEmployees.find((e: any) => e.id === id);
    return employee ? employee.name : 'Unknown Employee';
  };

  const formatTime = (isoString: string): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleBack = () => {
    router.back();
  };

  const uploadPhoto = async (photoUri: string): Promise<{ storage_path: string; mime_type: string } | null> => {
    try {
      console.log('Uploading photo:', photoUri);

      // Extract base64 data from URI
      // Handle both data URI format (data:image/jpeg;base64,/9j/4AAQ...) and plain base64
      let base64Data = photoUri;
      if (photoUri.includes(',')) {
        base64Data = photoUri.split(',')[1];
      } else if (photoUri.startsWith('file://')) {
        // If it's a file URI, read it as base64
        base64Data = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Convert base64 to bytes using Buffer (React Native compatible)
      const bytes = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const storagePath = `${currentEmployee?.org_id}/${currentProject?.id}/${timestamp}-${randomId}.jpg`;

      console.log('Uploading to storage path:', storagePath);

      // Upload to Supabase Storage with bytes
      const { data, error } = await supabase.storage
        .from('injury-report-photos')
        .upload(storagePath, bytes, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Photo upload error:', error);
        throw error;
      }

      console.log('Photo uploaded successfully:', data.path);

      return {
        storage_path: data.path,
        mime_type: 'image/jpeg',
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!currentProject?.id) {
      Alert.alert('Error', 'Project information is missing');
      return;
    }

    if (!incidentTime) {
      Alert.alert('Error', 'Incident time is required');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting injury report submission...');

      // Upload photos first
      const uploadedPhotos: { storage_path: string; mime_type: string }[] = [];
      for (const photo of photos) {
        console.log('Processing photo:', photo);
        const uploadedPhoto = await uploadPhoto(photo.uri);
        if (uploadedPhoto) {
          uploadedPhotos.push(uploadedPhoto);
        } else {
          console.warn('Failed to upload photo:', photo.uri);
        }
      }

      console.log('Uploaded photos:', uploadedPhotos);

      // Build injured employees payload
      const injuredEmployees = selectedEmployees.map((empId: string) => {
        const employee = employees.find((e: any) => e.id === empId);
        return {
          employee_id: empId,
          employee_name: employee ? employee.name : 'Unknown',
          notes: null,
        };
      });

      // Build external workers payload
      const externalWorkers: any[] = [];
      
      // Add subcontractor entries
      subcontractorEntries.forEach((entry: any) => {
        if (entry.workerNames) {
          const subcontractor = subcontractorsList.find((s: any) => s.id === entry.companyId);
          externalWorkers.push({
            temp_id: entry.id,
            subcontractor_id: entry.companyId || null,
            subcontractor_name: subcontractor ? subcontractor.name : entry.company,
            person_name: entry.workerNames,
            person_phone: null,
            person_company: subcontractor ? subcontractor.name : entry.company,
            notes: null,
          });
        }
      });

      // Add other injured persons
      otherInjured.forEach((entry: any) => {
        if (entry.name) {
          externalWorkers.push({
            temp_id: entry.id,
            subcontractor_id: null,
            subcontractor_name: null,
            person_name: entry.name,
            person_phone: null,
            person_company: null,
            notes: null,
          });
        }
      });

      // Build body parts payload (simplified - using description as body_part)
      const bodyParts: any[] = [];
      if (bodyPartDescription) {
        // For each injured person, create a body part entry
        selectedEmployees.forEach((empId: string) => {
          bodyParts.push({
            injured_person_type: 'employee',
            person_id: empId,
            body_part: bodyPartDescription,
            injury_type: null,
            side: null,
            notes: null,
          });
        });

        externalWorkers.forEach((ext: any) => {
          bodyParts.push({
            injured_person_type: 'external',
            person_id: ext.temp_id,
            body_part: bodyPartDescription,
            injury_type: null,
            side: null,
            notes: null,
          });
        });
      }

      // Build tasks payload
      const tasksPayload = selectedTasks.map((taskId: string) => {
        const task = tasks.find((t: any) => t.id === taskId);
        return {
          pre_task_card_id: taskId,
          task_name: task ? task.name : 'Unknown Task',
        };
      });

      // Build witnesses payload
      const witnessesPayload = witnesses
        .filter((w: any) => w.isEmployee === 'yes' || w.isEmployee === 'no')
        .map((witness: any) => {
          if (witness.isEmployee === 'yes' && witness.employeeId) {
            const employee = witnessEmployees.find((e: any) => e.id === witness.employeeId);
            return {
              witness_type: 'employee',
              employee_id: witness.employeeId,
              witness_name: employee ? employee.name : 'Unknown',
              witness_phone: null,
              witness_company: null,
              statement: null,
            };
          } else if (witness.isEmployee === 'no' && witness.name) {
            return {
              witness_type: 'external',
              employee_id: null,
              witness_name: witness.name,
              witness_phone: witness.phone || null,
              witness_company: null,
              statement: null,
            };
          }
          return null;
        })
        .filter((w: any) => w !== null);

      // Build equipment payload
      const equipmentPayload = selectedEquipment.map((eqId: string) => {
        const equipment = equipmentList.find((e: any) => e.id === eqId);
        return {
          equipment_id: eqId,
          equipment_name: equipment ? equipment.name : 'Unknown',
          notes: null,
        };
      });

      // Build materials payload
      const materialsPayload = selectedMaterials.map((matId: string) => {
        const material = materialsList.find((m: any) => m.id === matId);
        return {
          material_id: matId,
          material_name: material ? material.name : 'Unknown',
          notes: null,
        };
      });

      // Build the complete payload
      const payload = {
        project_id: currentProject.id,
        incident_time: incidentTime,
        area_description: specificArea || null,
        was_911_required: need911 === 'yes',
        was_911_called: called911 === 'yes',
        description_text: bodyPartDescription || null,
        photos: uploadedPhotos,
        injured_employees: injuredEmployees,
        external_workers: externalWorkers,
        body_parts: bodyParts,
        first_aid_provided: firstAidProvided === 'yes',
        tasks: tasksPayload,
        witnesses: witnessesPayload,
        equipment: equipmentPayload,
        materials: materialsPayload,
      };

      console.log('Submitting injury report payload:', JSON.stringify(payload, null, 2));

      // Get the current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('submit-injury-report', {
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Injury report submitted successfully:', data);

      setLoading(false);

      // Show success alert and navigate to home
      Alert.alert('Success', 'Incident report submitted successfully', [
        { text: 'OK', onPress: () => router.push('/(tabs)/(home)') }
      ]);
    } catch (error: any) {
      console.error('Error submitting injury report:', error);
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to submit injury report. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loading}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Injury Report</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Emergency & Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency & Photos</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Did the injury require 911?</Text>
            <Text style={styles.value}>{need911 === 'yes' ? 'Yes' : 'No'}</Text>
          </View>
          {need911 === 'yes' && (
            <View style={styles.row}>
              <Text style={styles.label}>Was 911 called?</Text>
              <Text style={styles.value}>{called911 === 'yes' ? 'Yes' : 'No'}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Photos Attached</Text>
            <Text style={styles.value}>{photos.length} photo(s)</Text>
          </View>
        </View>

        {/* Injured People */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Injured People</Text>
          
          {selectedEmployees.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Injured Employees</Text>
              {selectedEmployees.map((id: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {getEmployeeName(id)}</Text>
              ))}
            </View>
          )}

          {subcontractorInjured === 'yes' && subcontractorEntries.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Injured Subcontractors</Text>
              {subcontractorEntries.map((entry: any, index: number) => (
                <Text key={index} style={styles.listItem}>
                  • {entry.companyId ? getSubcontractorName(entry.companyId) : entry.company} - {entry.workerNames}
                </Text>
              ))}
            </View>
          )}

          {otherInjured.length > 0 && otherInjured.some((entry: any) => entry.name) && (
            <View style={styles.row}>
              <Text style={styles.label}>Other Injured Persons</Text>
              {otherInjured.filter((entry: any) => entry.name).map((entry: any, index: number) => (
                <Text key={index} style={styles.listItem}>• {entry.name}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Incident Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Time of Incident</Text>
            <Text style={styles.value}>{formatTime(incidentTime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Specific Area</Text>
            <Text style={styles.value}>{specificArea || 'N/A'}</Text>
          </View>
          
          {selectedTasks.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Tasks Being Performed</Text>
              {selectedTasks.map((id: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {getTaskName(id)}</Text>
              ))}
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>First Aid Provided</Text>
            <Text style={styles.value}>{firstAidProvided === 'yes' ? 'Yes' : 'No'}</Text>
          </View>

          {anyWitnesses === 'yes' && witnesses.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Witnesses</Text>
              {witnesses.map((witness: any, index: number) => {
                if (witness.isEmployee === 'yes' && witness.employeeId) {
                  return (
                    <Text key={index} style={styles.listItem}>
                      • {getWitnessEmployeeName(witness.employeeId)} (Employee)
                    </Text>
                  );
                } else if (witness.isEmployee === 'no' && witness.name) {
                  return (
                    <Text key={index} style={styles.listItem}>
                      • {witness.name} - {witness.phone}
                    </Text>
                  );
                }
                return null;
              })}
            </View>
          )}
        </View>

        {/* Equipment & Materials */}
        {(equipmentInvolved === 'yes' || materialsInvolved === 'yes') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment & Materials</Text>
            
            {equipmentInvolved === 'yes' && selectedEquipment.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Equipment Involved</Text>
                {selectedEquipment.map((id: string, index: number) => (
                  <Text key={index} style={styles.listItem}>• {getEquipmentName(id)}</Text>
                ))}
              </View>
            )}

            {materialsInvolved === 'yes' && selectedMaterials.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Materials Involved</Text>
                {selectedMaterials.map((id: string, index: number) => (
                  <Text key={index} style={styles.listItem}>• {getMaterialName(id)}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Injury Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Injury Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Body Part Affected</Text>
            <Text style={styles.value}>{bodyPartDescription || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
