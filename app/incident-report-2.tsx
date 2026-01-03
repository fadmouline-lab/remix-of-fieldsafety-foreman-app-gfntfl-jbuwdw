
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface SubcontractorEntry {
  id: string;
  company: string;
  workerNames: string;
}

interface OtherInjuredEntry {
  id: string;
  name: string;
}

const PLACEHOLDER_EMPLOYEES = ['John', 'Mike', 'Alex', 'Carlos'];
const PLACEHOLDER_SUBCONTRACTORS = ['ABC Demo', 'XYZ Hauling', 'Prime Concrete'];

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
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedEmployees: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  subcontractorCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  otherInjuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  otherInjuredInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  removeIconButton: {
    padding: 8,
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default function IncidentReportPage2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    params.selectedEmployees ? JSON.parse(params.selectedEmployees as string) : []
  );
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [subcontractorInjured, setSubcontractorInjured] = useState<'yes' | 'no' | null>(
    params.subcontractorInjured ? (params.subcontractorInjured as 'yes' | 'no') : null
  );
  const [subcontractors, setSubcontractors] = useState<SubcontractorEntry[]>(
    params.subcontractors ? JSON.parse(params.subcontractors as string) : []
  );
  const [otherInjured, setOtherInjured] = useState<OtherInjuredEntry[]>(
    params.otherInjured ? JSON.parse(params.otherInjured as string) : [{ id: '1', name: '' }]
  );

  const toggleEmployee = (employee: string) => {
    if (selectedEmployees.includes(employee)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== employee));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const addSubcontractor = () => {
    setSubcontractors([
      ...subcontractors,
      { id: Date.now().toString(), company: '', workerNames: '' },
    ]);
  };

  const updateSubcontractorCompany = (id: string, company: string) => {
    setSubcontractors(
      subcontractors.map((s) => (s.id === id ? { ...s, company } : s))
    );
  };

  const updateSubcontractorWorkers = (id: string, workerNames: string) => {
    setSubcontractors(
      subcontractors.map((s) => (s.id === id ? { ...s, workerNames } : s))
    );
  };

  const removeSubcontractor = (id: string) => {
    setSubcontractors(subcontractors.filter((s) => s.id !== id));
  };

  const addOtherInjured = () => {
    setOtherInjured([...otherInjured, { id: Date.now().toString(), name: '' }]);
  };

  const updateOtherInjured = (id: string, name: string) => {
    setOtherInjured(otherInjured.map((o) => (o.id === id ? { ...o, name } : o)));
  };

  const removeOtherInjured = (id: string) => {
    if (otherInjured.length > 1) {
      setOtherInjured(otherInjured.filter((o) => o.id !== id));
    }
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-3',
      params: {
        ...params,
        selectedEmployees: JSON.stringify(selectedEmployees),
        subcontractorInjured: subcontractorInjured || '',
        subcontractors: JSON.stringify(subcontractors),
        otherInjured: JSON.stringify(otherInjured),
      },
    });
  };

  const handleBack = () => {
    router.push({
      pathname: '/incident-report-1',
      params: {
        need911: params.need911 as string,
        called911: params.called911 as string,
        photos: params.photos as string,
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
        <Text style={styles.headerTitle}>Injured People</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Select injured employees</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowEmployeeModal(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedEmployees.length > 0
                ? `${selectedEmployees.length} selected`
                : 'Select employees'}
            </Text>
            <IconSymbol 
              ios_icon_name="chevron.down" 
              android_material_icon_name="arrow-drop-down" 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>

          {selectedEmployees.length > 0 && (
            <View style={styles.selectedEmployees}>
              {selectedEmployees.map((emp) => (
                <View key={emp} style={styles.chip}>
                  <Text style={styles.chipText}>{emp}</Text>
                  <TouchableOpacity onPress={() => toggleEmployee(emp)}>
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={14} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Was a subcontractor injured?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  subcontractorInjured === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => setSubcontractorInjured('yes')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    subcontractorInjured === 'yes' && styles.toggleButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  subcontractorInjured === 'no' && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setSubcontractorInjured('no');
                  setSubcontractors([]);
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    subcontractorInjured === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {subcontractorInjured === 'yes' && (
            <>
              {subcontractors.map((sub, index) => (
                <View key={sub.id} style={styles.subcontractorCard}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSubcontractor(sub.id)}
                  >
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={24} 
                      color="#FF6B6B" 
                    />
                  </TouchableOpacity>
                  <Text style={styles.label}>Select subcontractor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Select from list..."
                    value={sub.company}
                    onChangeText={(text) => updateSubcontractorCompany(sub.id, text)}
                  />
                  <Text style={[styles.label, { marginTop: 12 }]}>
                    Name of injured subcontractor worker(s)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter names..."
                    value={sub.workerNames}
                    onChangeText={(text) => updateSubcontractorWorkers(sub.id, text)}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addSubcontractor}>
                <Text style={styles.addButtonText}>+ Add another subcontractor</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Other injured person (if not listed above)</Text>
          {otherInjured.map((entry, index) => (
            <View key={entry.id} style={styles.otherInjuredRow}>
              <TextInput
                style={styles.otherInjuredInput}
                placeholder="Enter name..."
                value={entry.name}
                onChangeText={(text) => updateOtherInjured(entry.id, text)}
              />
              {otherInjured.length > 1 && (
                <TouchableOpacity
                  style={styles.removeIconButton}
                  onPress={() => removeOtherInjured(entry.id)}
                >
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={24} 
                    color="#FF6B6B" 
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addOtherInjured}>
            <Text style={styles.addButtonText}>Add more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <Modal visible={showEmployeeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employees</Text>
            <ScrollView>
              {PLACEHOLDER_EMPLOYEES.map((emp) => (
                <TouchableOpacity
                  key={emp}
                  style={styles.modalOption}
                  onPress={() => toggleEmployee(emp)}
                >
                  <Text style={styles.modalOptionText}>
                    {selectedEmployees.includes(emp) ? '✓ ' : ''}
                    {emp}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmployeeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
