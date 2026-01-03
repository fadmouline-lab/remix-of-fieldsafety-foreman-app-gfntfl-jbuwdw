
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default function IncidentReportPage5() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

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

  const handleSubmit = async () => {
    // TODO: Backend Integration - Submit incident report to the backend API
    Alert.alert('Success', 'Incident report submitted successfully', [
      { text: 'OK', onPress: () => router.push('/(tabs)/(home)') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
              {selectedEmployees.map((id: string) => (
                <Text key={id} style={styles.listItem}>• {getEmployeeName(id)}</Text>
              ))}
            </View>
          )}

          {subcontractorInjured === 'yes' && subcontractorEntries.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Injured Subcontractors</Text>
              {subcontractorEntries.map((entry: any) => (
                <Text key={entry.id} style={styles.listItem}>
                  • {entry.companyId ? getSubcontractorName(entry.companyId) : entry.company} - {entry.workerNames}
                </Text>
              ))}
            </View>
          )}

          {otherInjured.length > 0 && otherInjured.some((entry: any) => entry.name) && (
            <View style={styles.row}>
              <Text style={styles.label}>Other Injured Persons</Text>
              {otherInjured.filter((entry: any) => entry.name).map((entry: any) => (
                <Text key={entry.id} style={styles.listItem}>• {entry.name}</Text>
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
              {selectedTasks.map((id: string) => (
                <Text key={id} style={styles.listItem}>• {getTaskName(id)}</Text>
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
              {witnesses.map((witness: any) => {
                if (witness.isEmployee === 'yes' && witness.employeeId) {
                  return (
                    <Text key={witness.id} style={styles.listItem}>
                      • {getWitnessEmployeeName(witness.employeeId)} (Employee)
                    </Text>
                  );
                } else if (witness.isEmployee === 'no' && witness.name) {
                  return (
                    <Text key={witness.id} style={styles.listItem}>
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
                {selectedEquipment.map((id: string) => (
                  <Text key={id} style={styles.listItem}>• {getEquipmentName(id)}</Text>
                ))}
              </View>
            )}

            {materialsInvolved === 'yes' && selectedMaterials.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Materials Involved</Text>
                {selectedMaterials.map((id: string) => (
                  <Text key={id} style={styles.listItem}>• {getMaterialName(id)}</Text>
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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}
