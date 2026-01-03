
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SearchableDropdown from '@/components/SearchableDropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface Witness {
  id: string;
  isEmployee: 'yes' | 'no' | null;
  employeeId: string;
  employeeName: string;
  name: string;
  phone: string;
}

interface Task {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

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
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  timeButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: colors.text,
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
  selectedTasks: {
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
  witnessCard: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default function IncidentReportPage3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

  const [incidentTime, setIncidentTime] = useState<Date>(
    params.incidentTime ? new Date(params.incidentTime as string) : new Date()
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [specificArea, setSpecificArea] = useState(params.specificArea as string || '');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    params.selectedTasks ? JSON.parse(params.selectedTasks as string) : []
  );
  const [showTaskModal, setShowTaskModal] = useState(false);

  // First aid state
  const [firstAidProvided, setFirstAidProvided] = useState<'yes' | 'no' | null>(
    params.firstAidProvided ? (params.firstAidProvided as 'yes' | 'no') : null
  );

  // Witnesses state
  const [anyWitnesses, setAnyWitnesses] = useState<'yes' | 'no' | null>(
    params.anyWitnesses ? (params.anyWitnesses as 'yes' | 'no') : null
  );
  const [witnesses, setWitnesses] = useState<Witness[]>(
    params.witnesses ? JSON.parse(params.witnesses as string) : []
  );

  // Employees for witness selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [currentWitnessId, setCurrentWitnessId] = useState<string | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Fetch tasks from Supabase (filtered by project_id)
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentProject?.id) {
        console.log('No project_id available');
        return;
      }

      setLoadingTasks(true);
      try {
        const { data, error } = await supabase
          .from('pre_task_cards')
          .select('id, task_name')
          .eq('project_id', currentProject.id)
          .eq('status', 'active')
          .order('task_name', { ascending: true });

        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          const formattedTasks = (data || []).map((task) => ({
            id: task.id,
            name: task.task_name,
          }));
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error('Exception fetching tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [currentProject?.id]);

  // Fetch employees for witness selection
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentEmployee?.org_id) {
        console.log('No org_id available');
        return;
      }

      setLoadingEmployees(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name')
          .eq('org_id', currentEmployee.org_id)
          .eq('status', 'Active')
          .order('last_name', { ascending: true });

        if (error) {
          console.error('Error fetching employees:', error);
        } else {
          const formattedEmployees = (data || []).map((emp) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
          }));
          setEmployees(formattedEmployees);
        }
      } catch (error) {
        console.error('Exception fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [currentEmployee?.org_id]);

  const toggleTask = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.name || taskId;
  };

  const addWitness = () => {
    setWitnesses([
      ...witnesses,
      {
        id: Date.now().toString(),
        isEmployee: null,
        employeeId: '',
        employeeName: '',
        name: '',
        phone: '',
      },
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

  const handleSelectEmployeeWitness = (witnessId: string) => {
    setCurrentWitnessId(witnessId);
    setShowEmployeeModal(true);
  };

  const handleEmployeeSelected = (employeeId: string) => {
    if (currentWitnessId) {
      const employee = employees.find((e) => e.id === employeeId);
      updateWitness(currentWitnessId, {
        employeeId,
        employeeName: employee?.name || '',
      });
      setShowEmployeeModal(false);
      setCurrentWitnessId(null);
    }
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-4',
      params: {
        ...params,
        incidentTime: incidentTime.toISOString(),
        specificArea,
        selectedTasks: JSON.stringify(selectedTasks),
        tasks: JSON.stringify(tasks), // Pass full tasks array
        firstAidProvided: firstAidProvided || '',
        anyWitnesses: anyWitnesses || '',
        witnesses: JSON.stringify(witnesses),
        witnessEmployees: JSON.stringify(employees), // Pass employees for witness mapping
      },
    });
  };

  const handleBack = () => {
    router.push({
      pathname: '/incident-report-2',
      params: {
        need911: params.need911 as string,
        called911: params.called911 as string,
        photos: params.photos as string,
        selectedEmployees: params.selectedEmployees as string,
        subcontractorInjured: params.subcontractorInjured as string,
        subcontractors: params.subcontractors as string,
        otherInjured: params.otherInjured as string,
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
        <Text style={styles.headerTitle}>Incident Details</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Time of incident</Text>
          <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.timeButtonText}>{formatTime(incidentTime)}</Text>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="access-time"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={incidentTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Specific area where injury occurred</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location..."
            placeholderTextColor={colors.text + '80'}
            value={specificArea}
            onChangeText={setSpecificArea}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What task(s) were being performed?</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTaskModal(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedTasks.length > 0 ? `${selectedTasks.length} selected` : 'Select tasks'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>

          {selectedTasks.length > 0 && (
            <View style={styles.selectedTasks}>
              {selectedTasks.map((taskId) => (
                <View key={taskId} style={styles.chip}>
                  <Text style={styles.chipText}>{getTaskName(taskId)}</Text>
                  <TouchableOpacity onPress={() => toggleTask(taskId)}>
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
            <Text style={styles.toggleLabel}>Was first aid provided?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  firstAidProvided === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => setFirstAidProvided('yes')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    firstAidProvided === 'yes' && styles.toggleButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  firstAidProvided === 'no' && styles.toggleButtonActive,
                ]}
                onPress={() => setFirstAidProvided('no')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    firstAidProvided === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Any witnesses?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  anyWitnesses === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => setAnyWitnesses('yes')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    anyWitnesses === 'yes' && styles.toggleButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  anyWitnesses === 'no' && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setAnyWitnesses('no');
                  setWitnesses([]);
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    anyWitnesses === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {anyWitnesses === 'yes' && (
            <>
              {witnesses.map((witness) => (
                <View key={witness.id} style={styles.witnessCard}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeWitness(witness.id)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
                      color="#FF6B6B"
                    />
                  </TouchableOpacity>

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>Was the witness an employee?</Text>
                    <View style={styles.toggleButtons}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          witness.isEmployee === 'yes' && styles.toggleButtonActive,
                        ]}
                        onPress={() => updateWitness(witness.id, { isEmployee: 'yes' })}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            witness.isEmployee === 'yes' && styles.toggleButtonTextActive,
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
                            styles.toggleButtonText,
                            witness.isEmployee === 'no' && styles.toggleButtonTextActive,
                          ]}
                        >
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {witness.isEmployee === 'yes' && (
                    <>
                      <Text style={[styles.label, { marginTop: 12 }]}>Select employee</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => handleSelectEmployeeWitness(witness.id)}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {witness.employeeName || 'Select from list...'}
                        </Text>
                        <IconSymbol
                          ios_icon_name="chevron.down"
                          android_material_icon_name="arrow-drop-down"
                          size={20}
                          color={colors.text}
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  {witness.isEmployee === 'no' && (
                    <>
                      <Text style={[styles.label, { marginTop: 12 }]}>Witness name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter name..."
                        placeholderTextColor={colors.text + '80'}
                        value={witness.name}
                        onChangeText={(text) => updateWitness(witness.id, { name: text })}
                      />
                      <Text style={[styles.label, { marginTop: 12 }]}>Witness phone number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter phone..."
                        placeholderTextColor={colors.text + '80'}
                        value={witness.phone}
                        onChangeText={(text) => updateWitness(witness.id, { phone: text })}
                        keyboardType="phone-pad"
                      />
                    </>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addWitness}>
                <Text style={styles.addButtonText}>+ Add another witness</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <SearchableDropdown
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Select Tasks"
        items={tasks}
        selectedIds={selectedTasks}
        onToggleItem={toggleTask}
        multiSelect={true}
        loading={loadingTasks}
        initialLimit={20}
      />

      <SearchableDropdown
        visible={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setCurrentWitnessId(null);
        }}
        title="Select Employee Witness"
        items={employees}
        selectedIds={currentWitnessId && witnesses.find((w) => w.id === currentWitnessId)?.employeeId ? [witnesses.find((w) => w.id === currentWitnessId)!.employeeId] : []}
        onToggleItem={handleEmployeeSelected}
        multiSelect={false}
        loading={loadingEmployees}
        initialLimit={20}
      />
    </View>
  );
}
