
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
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
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 16,
    color: colors.text,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  chip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
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

  const photos = params.photos ? JSON.parse(params.photos as string) : [];
  const selectedEmployees = params.selectedEmployees
    ? JSON.parse(params.selectedEmployees as string)
    : [];
  const subcontractors = params.subcontractors
    ? JSON.parse(params.subcontractors as string)
    : [];
  const otherInjured = params.otherInjured ? JSON.parse(params.otherInjured as string) : [];
  const selectedTasks = params.selectedTasks ? JSON.parse(params.selectedTasks as string) : [];
  const witnesses = params.witnesses ? JSON.parse(params.witnesses as string) : [];
  const selectedEquipment = params.selectedEquipment
    ? JSON.parse(params.selectedEquipment as string)
    : [];
  const selectedMaterials = params.selectedMaterials
    ? JSON.parse(params.selectedMaterials as string)
    : [];

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = () => {
    Alert.alert('Success', 'Injury report submitted successfully', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/(home)'),
      },
    ]);
  };

  const handleBack = () => {
    router.push({
      pathname: '/incident-report-4',
      params: {
        need911: params.need911 as string,
        called911: params.called911 as string,
        photos: params.photos as string,
        selectedEmployees: params.selectedEmployees as string,
        subcontractorInjured: params.subcontractorInjured as string,
        subcontractors: params.subcontractors as string,
        otherInjured: params.otherInjured as string,
        incidentTime: params.incidentTime as string,
        specificArea: params.specificArea as string,
        selectedTasks: params.selectedTasks as string,
        firstAidProvided: params.firstAidProvided as string,
        anyWitnesses: params.anyWitnesses as string,
        witnesses: params.witnesses as string,
        equipmentInvolved: params.equipmentInvolved as string,
        selectedEquipment: params.selectedEquipment as string,
        materialsInvolved: params.materialsInvolved as string,
        selectedMaterials: params.selectedMaterials as string,
        bodyPartDescription: params.bodyPartDescription as string,
      },
    });
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Response</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Need to call 911?</Text>
            <Text style={styles.rowValue}>{params.need911 === 'yes' ? 'Yes' : 'No'}</Text>
          </View>
          {params.need911 === 'yes' && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Called 911?</Text>
              <Text style={styles.rowValue}>{params.called911 === 'yes' ? 'Yes' : 'No'}</Text>
            </View>
          )}
        </View>

        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photoGrid}>
              {photos.map((photo: any) => (
                <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Injured People</Text>
          {selectedEmployees.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Employees</Text>
              <View style={styles.chipContainer}>
                {selectedEmployees.map((emp: string) => (
                  <View key={emp} style={styles.chip}>
                    <Text style={styles.chipText}>{emp}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {subcontractors.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Subcontractors</Text>
              {subcontractors.map((sub: any) => (
                <Text key={sub.id} style={styles.rowValue}>
                  {sub.company} - {sub.workerNames}
                </Text>
              ))}
            </View>
          )}
          {otherInjured.some((o: any) => o.name) && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Other injured persons</Text>
              {otherInjured
                .filter((o: any) => o.name)
                .map((o: any) => (
                  <Text key={o.id} style={styles.rowValue}>
                    {o.name}
                  </Text>
                ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Time of incident</Text>
            <Text style={styles.rowValue}>{formatTime(params.incidentTime as string)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Specific area</Text>
            <Text style={styles.rowValue}>{params.specificArea || 'N/A'}</Text>
          </View>
          {selectedTasks.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tasks being performed</Text>
              <View style={styles.chipContainer}>
                {selectedTasks.map((task: string) => (
                  <View key={task} style={styles.chip}>
                    <Text style={styles.chipText}>{task}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>First aid provided?</Text>
            <Text style={styles.rowValue}>
              {params.firstAidProvided === 'yes' ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {witnesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            {witnesses.map((witness: any) => (
              <View key={witness.id} style={styles.row}>
                <Text style={styles.rowValue}>
                  {witness.isEmployee === 'yes'
                    ? `Employee: ${witness.employeeName}`
                    : `${witness.name} - ${witness.phone}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment and Materials</Text>
          {selectedEquipment.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Equipment</Text>
              <View style={styles.chipContainer}>
                {selectedEquipment.map((equip: string) => (
                  <View key={equip} style={styles.chip}>
                    <Text style={styles.chipText}>{equip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {selectedMaterials.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Materials</Text>
              <View style={styles.chipContainer}>
                {selectedMaterials.map((mat: string) => (
                  <View key={mat} style={styles.chip}>
                    <Text style={styles.chipText}>{mat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Part Affected</Text>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{params.bodyPartDescription || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Injury Report</Text>
      </TouchableOpacity>
    </View>
  );
}
