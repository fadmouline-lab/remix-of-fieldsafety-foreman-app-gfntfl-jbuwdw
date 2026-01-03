
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const PLACEHOLDER_TASKS = ['Demolition', 'Loading debris', 'Equipment operation', 'Material handling'];
const PLACEHOLDER_EMPLOYEES = ['John', 'Mike', 'Alex', 'Carlos'];

interface Witness {
  id: string;
  isEmployee: 'yes' | 'no' | null;
  employeeName: string;
  name: string;
  phone: string;
}

const IncidentReportPage3: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [incidentTime, setIncidentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  
  const [firstAidProvided, setFirstAidProvided] = useState<'yes' | 'no' | null>(null);
  const [anyWitnesses, setAnyWitnesses] = useState<'yes' | 'no' | null>(null);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [currentWitnessId, setCurrentWitnessId] = useState<string | null>(null);

  const toggleTask = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const addWitness = () => {
    const newId = Date.now().toString();
    setWitnesses([
      ...witnesses,
      { id: newId, isEmployee: null, employeeName: '', name: '', phone: '' },
    ]);
  };

  const updateWitness = (id: string, updates: Partial<Witness>) => {
    setWitnesses(witnesses.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const removeWitness = (id: string) => {
    setWitnesses(witnesses.filter((w) => w.id !== id));
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIncidentTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-4',
      params: {
        ...params,
        incidentTime: incidentTime.toISOString(),
        location,
        selectedTasks: JSON.stringify(selectedTasks),
        firstAidProvided: firstAidProvided || '',
        anyWitnesses: anyWitnesses || '',
        witnesses: JSON.stringify(witnesses),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Time of Incident */}
        <Text style={styles.label}>Time of incident</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeButtonText}>{formatTime(incidentTime)}</Text>
          <IconSymbol name="clock" size={20} color={colors.text} />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={incidentTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {/* Location */}
        <Text style={[styles.label, styles.marginTop]}>Specific area where injury occurred</Text>
        <TextInput
          style={styles.textInput}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Tasks */}
        <Text style={[styles.label, styles.marginTop]}>What task(s) were being performed?</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowTaskDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedTasks.length > 0 ? `${selectedTasks.length} selected` : 'Select tasks'}
          </Text>
          <IconSymbol name="chevron.down" size={20} color={colors.text} />
        </TouchableOpacity>

        {selectedTasks.length > 0 && (
          <View style={styles.selectedContainer}>
            {selectedTasks.map((task) => (
              <View key={task} style={styles.chip}>
                <Text style={styles.chipText}>{task}</Text>
                <TouchableOpacity onPress={() => toggleTask(task)}>
                  <IconSymbol name="xmark" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* First Aid */}
        <Text style={[styles.label, styles.marginTop]}>Was first aid provided?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, firstAidProvided === 'yes' && styles.toggleButtonActive]}
            onPress={() => setFirstAidProvided('yes')}
          >
            <Text
              style={[styles.toggleText, firstAidProvided === 'yes' && styles.toggleTextActive]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, firstAidProvided === 'no' && styles.toggleButtonActive]}
            onPress={() => setFirstAidProvided('no')}
          >
            <Text
              style={[styles.toggleText, firstAidProvided === 'no' && styles.toggleTextActive]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Witnesses */}
        <Text style={[styles.label, styles.marginTop]}>Any witnesses?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, anyWitnesses === 'yes' && styles.toggleButtonActive]}
            onPress={() => {
              setAnyWitnesses('yes');
              if (witnesses.length === 0) addWitness();
            }}
          >
            <Text style={[styles.toggleText, anyWitnesses === 'yes' && styles.toggleTextActive]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, anyWitnesses === 'no' && styles.toggleButtonActive]}
            onPress={() => {
              setAnyWitnesses('no');
              setWitnesses([]);
            }}
          >
            <Text style={[styles.toggleText, anyWitnesses === 'no' && styles.toggleTextActive]}>
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Witness Entries */}
        {anyWitnesses === 'yes' && (
          <>
            {witnesses.map((witness, index) => (
              <View key={witness.id} style={styles.witnessEntry}>
                <View style={styles.witnessHeader}>
                  <Text style={styles.witnessLabel}>Witness {index + 1}</Text>
                  {witnesses.length > 1 && (
                    <TouchableOpacity onPress={() => removeWitness(witness.id)}>
                      <IconSymbol name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.inputLabel}>Was the witness an employee?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      witness.isEmployee === 'yes' && styles.toggleButtonActive,
                    ]}
                    onPress={() => updateWitness(witness.id, { isEmployee: 'yes' })}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        witness.isEmployee === 'yes' && styles.toggleTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      witness.isEmployee === 'no' && styles.toggleButtonActive,
                    ]}
                    onPress={() => updateWitness(witness.id, { isEmployee: 'no' })}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        witness.isEmployee === 'no' && styles.toggleTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>

                {witness.isEmployee === 'yes' && (
                  <>
                    <Text style={[styles.inputLabel, styles.marginTopSmall]}>
                      Select employee
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => {
                        setCurrentWitnessId(witness.id);
                        setShowEmployeeDropdown(true);
                      }}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {witness.employeeName || 'Select employee'}
                      </Text>
                      <IconSymbol name="chevron.down" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </>
                )}

                {witness.isEmployee === 'no' && (
                  <>
                    <Text style={[styles.inputLabel, styles.marginTopSmall]}>Witness name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={witness.name}
                      onChangeText={(text) => updateWitness(witness.id, { name: text })}
                      placeholder="Enter name"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={[styles.inputLabel, styles.marginTopSmall]}>
                      Witness phone number
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      value={witness.phone}
                      onChangeText={(text) => updateWitness(witness.id, { phone: text })}
                      placeholder="Enter phone number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addWitness}>
              <IconSymbol name="plus" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Another Witness</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Task Dropdown Modal */}
      <Modal visible={showTaskDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTaskDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Tasks</Text>
            {PLACEHOLDER_TASKS.map((task) => (
              <TouchableOpacity
                key={task}
                style={styles.modalItem}
                onPress={() => toggleTask(task)}
              >
                <Text style={styles.modalItemText}>{task}</Text>
                {selectedTasks.includes(task) && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTaskDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Employee Dropdown Modal */}
      <Modal visible={showEmployeeDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmployeeDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employee</Text>
            {PLACEHOLDER_EMPLOYEES.map((employee) => (
              <TouchableOpacity
                key={employee}
                style={styles.modalItem}
                onPress={() => {
                  if (currentWitnessId) {
                    updateWitness(currentWitnessId, { employeeName: employee });
                  }
                  setShowEmployeeDropdown(false);
                }}
              >
                <Text style={styles.modalItemText}>{employee}</Text>
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
  timeButton: {
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
  timeButtonText: {
    fontSize: 16,
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
  witnessEntry: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  witnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  witnessLabel: {
    fontSize: 16,
    fontWeight: '600',
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

export default IncidentReportPage3;
