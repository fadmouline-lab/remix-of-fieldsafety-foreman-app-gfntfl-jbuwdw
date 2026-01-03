
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const PLACEHOLDER_EMPLOYEES = ['John', 'Mike', 'Alex', 'Carlos'];
const PLACEHOLDER_SUBCONTRACTORS = ['ABC Demo', 'XYZ Hauling', 'Prime Concrete'];

interface SubcontractorEntry {
  id: string;
  company: string;
  workerNames: string;
}

const IncidentReportPage2: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  const [subcontractorInjured, setSubcontractorInjured] = useState<'yes' | 'no' | null>(null);
  const [subcontractors, setSubcontractors] = useState<SubcontractorEntry[]>([]);
  const [showSubcontractorDropdown, setShowSubcontractorDropdown] = useState(false);
  const [currentSubcontractorId, setCurrentSubcontractorId] = useState<string | null>(null);
  
  const [otherInjured, setOtherInjured] = useState('');

  const toggleEmployee = (employee: string) => {
    if (selectedEmployees.includes(employee)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== employee));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const addSubcontractor = () => {
    const newId = Date.now().toString();
    setSubcontractors([...subcontractors, { id: newId, company: '', workerNames: '' }]);
  };

  const updateSubcontractorCompany = (id: string, company: string) => {
    setSubcontractors(
      subcontractors.map((sub) => (sub.id === id ? { ...sub, company } : sub))
    );
  };

  const updateSubcontractorWorkers = (id: string, workerNames: string) => {
    setSubcontractors(
      subcontractors.map((sub) => (sub.id === id ? { ...sub, workerNames } : sub))
    );
  };

  const removeSubcontractor = (id: string) => {
    setSubcontractors(subcontractors.filter((sub) => sub.id !== id));
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-3',
      params: {
        ...params,
        selectedEmployees: JSON.stringify(selectedEmployees),
        subcontractorInjured: subcontractorInjured || '',
        subcontractors: JSON.stringify(subcontractors),
        otherInjured,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Injured People</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Employee Selection */}
        <Text style={styles.label}>Select injured employees</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowEmployeeDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedEmployees.length > 0
              ? `${selectedEmployees.length} selected`
              : 'Select employees'}
          </Text>
          <IconSymbol name="chevron.down" size={20} color={colors.text} />
        </TouchableOpacity>

        {selectedEmployees.length > 0 && (
          <View style={styles.selectedContainer}>
            {selectedEmployees.map((employee) => (
              <View key={employee} style={styles.chip}>
                <Text style={styles.chipText}>{employee}</Text>
                <TouchableOpacity onPress={() => toggleEmployee(employee)}>
                  <IconSymbol name="xmark" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Subcontractor Toggle */}
        <Text style={[styles.label, styles.marginTop]}>Was a subcontractor injured?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              subcontractorInjured === 'yes' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setSubcontractorInjured('yes');
              if (subcontractors.length === 0) addSubcontractor();
            }}
          >
            <Text
              style={[
                styles.toggleText,
                subcontractorInjured === 'yes' && styles.toggleTextActive,
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
                styles.toggleText,
                subcontractorInjured === 'no' && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subcontractor Entries */}
        {subcontractorInjured === 'yes' && (
          <>
            {subcontractors.map((sub, index) => (
              <View key={sub.id} style={styles.subcontractorEntry}>
                <View style={styles.subcontractorHeader}>
                  <Text style={styles.subcontractorLabel}>Subcontractor {index + 1}</Text>
                  {subcontractors.length > 1 && (
                    <TouchableOpacity onPress={() => removeSubcontractor(sub.id)}>
                      <IconSymbol name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.inputLabel}>Select subcontractor</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setCurrentSubcontractorId(sub.id);
                    setShowSubcontractorDropdown(true);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {sub.company || 'Select company'}
                  </Text>
                  <IconSymbol name="chevron.down" size={20} color={colors.text} />
                </TouchableOpacity>

                {sub.company && (
                  <>
                    <Text style={[styles.inputLabel, styles.marginTopSmall]}>
                      Name of injured subcontractor worker(s)
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      value={sub.workerNames}
                      onChangeText={(text) => updateSubcontractorWorkers(sub.id, text)}
                      placeholder="Enter worker names"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addSubcontractor}>
              <IconSymbol name="plus" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Another Subcontractor</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Other Injured Person */}
        <Text style={[styles.label, styles.marginTop]}>
          Other injured person (if not listed above)
        </Text>
        <TextInput
          style={styles.textInput}
          value={otherInjured}
          onChangeText={setOtherInjured}
          placeholder="Optional"
          placeholderTextColor={colors.textSecondary}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Employee Dropdown Modal */}
      <Modal visible={showEmployeeDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmployeeDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employees</Text>
            {PLACEHOLDER_EMPLOYEES.map((employee) => (
              <TouchableOpacity
                key={employee}
                style={styles.modalItem}
                onPress={() => toggleEmployee(employee)}
              >
                <Text style={styles.modalItemText}>{employee}</Text>
                {selectedEmployees.includes(employee) && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEmployeeDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subcontractor Dropdown Modal */}
      <Modal visible={showSubcontractorDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubcontractorDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subcontractor</Text>
            {PLACEHOLDER_SUBCONTRACTORS.map((company) => (
              <TouchableOpacity
                key={company}
                style={styles.modalItem}
                onPress={() => {
                  if (currentSubcontractorId) {
                    updateSubcontractorCompany(currentSubcontractorId, company);
                  }
                  setShowSubcontractorDropdown(false);
                }}
              >
                <Text style={styles.modalItemText}>{company}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 24,
  },
  marginTopSmall: {
    marginTop: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 14,
    color: colors.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  toggleTextActive: {
    color: '#fff',
  },
  subcontractorEntry: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  subcontractorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subcontractorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  textInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default IncidentReportPage2;
