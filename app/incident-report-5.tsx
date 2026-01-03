
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const IncidentReportPage5: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Parse all data from params
  const need911 = params.need911 as string;
  const called911 = params.called911 as string;
  const photos = params.photos ? JSON.parse(params.photos as string) : [];
  
  const selectedEmployees = params.selectedEmployees
    ? JSON.parse(params.selectedEmployees as string)
    : [];
  const subcontractorInjured = params.subcontractorInjured as string;
  const subcontractors = params.subcontractors
    ? JSON.parse(params.subcontractors as string)
    : [];
  const otherInjured = params.otherInjured as string;
  
  const incidentTime = params.incidentTime
    ? new Date(params.incidentTime as string)
    : new Date();
  const location = params.location as string;
  const selectedTasks = params.selectedTasks
    ? JSON.parse(params.selectedTasks as string)
    : [];
  const firstAidProvided = params.firstAidProvided as string;
  const anyWitnesses = params.anyWitnesses as string;
  const witnesses = params.witnesses ? JSON.parse(params.witnesses as string) : [];
  
  const equipmentInvolved = params.equipmentInvolved as string;
  const selectedEquipment = params.selectedEquipment
    ? JSON.parse(params.selectedEquipment as string)
    : [];
  const materialsInvolved = params.materialsInvolved as string;
  const selectedMaterials = params.selectedMaterials
    ? JSON.parse(params.selectedMaterials as string)
    : [];
  const bodyPartDescription = params.bodyPartDescription as string;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate submission delay
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Injury report submitted successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/(home)'),
        },
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Injury Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Emergency Response */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Response</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Need to call 911:</Text>
            <Text style={styles.rowValue}>{need911 === 'yes' ? 'Yes' : 'No'}</Text>
          </View>
          {need911 === 'yes' && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Called 911:</Text>
              <Text style={styles.rowValue}>{called911 === 'yes' ? 'Yes' : 'No'}</Text>
            </View>
          )}
        </View>

        {/* Photos */}
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri: string, index: number) => (
                <Image key={index} source={{ uri }} style={styles.photoThumbnail} />
              ))}
            </View>
          </View>
        )}

        {/* Injured People */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Injured People</Text>
          {selectedEmployees.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Employees:</Text>
              <Text style={styles.rowValue}>{selectedEmployees.join(', ')}</Text>
            </View>
          )}
          {subcontractorInjured === 'yes' && subcontractors.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Subcontractors:</Text>
              {subcontractors.map((sub: any, index: number) => (
                <View key={sub.id} style={styles.subItem}>
                  <Text style={styles.rowValue}>
                    {sub.company} - {sub.workerNames}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {otherInjured && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Other:</Text>
              <Text style={styles.rowValue}>{otherInjured}</Text>
            </View>
          )}
        </View>

        {/* Incident Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Time:</Text>
            <Text style={styles.rowValue}>{formatTime(incidentTime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Location:</Text>
            <Text style={styles.rowValue}>{location || 'Not specified'}</Text>
          </View>
          {selectedTasks.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tasks:</Text>
              <Text style={styles.rowValue}>{selectedTasks.join(', ')}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>First aid provided:</Text>
            <Text style={styles.rowValue}>{firstAidProvided === 'yes' ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        {/* Witnesses */}
        {anyWitnesses === 'yes' && witnesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            {witnesses.map((witness: any, index: number) => (
              <View key={witness.id} style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Witness {index + 1}:</Text>
                {witness.isEmployee === 'yes' ? (
                  <Text style={styles.rowValue}>Employee: {witness.employeeName}</Text>
                ) : (
                  <>
                    <Text style={styles.rowValue}>Name: {witness.name}</Text>
                    <Text style={styles.rowValue}>Phone: {witness.phone}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Equipment and Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment and Materials</Text>
          {equipmentInvolved === 'yes' && selectedEquipment.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Equipment:</Text>
              <Text style={styles.rowValue}>{selectedEquipment.join(', ')}</Text>
            </View>
          )}
          {materialsInvolved === 'yes' && selectedMaterials.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Materials:</Text>
              <Text style={styles.rowValue}>{selectedMaterials.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Body Part Affected */}
        {bodyPartDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Part Affected</Text>
            <Text style={styles.rowValue}>{bodyPartDescription}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Injury Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  subsection: {
    marginTop: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  subItem: {
    marginBottom: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default IncidentReportPage5;
