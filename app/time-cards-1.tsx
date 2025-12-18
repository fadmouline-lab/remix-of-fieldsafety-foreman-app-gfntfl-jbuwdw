
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Worker {
  employee_id: string;
  name: string;
  hours: number;
  ptpSigned: boolean;
}

interface AvailableEmployee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export default function TimeCardsPage1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const [showAddWorkers, setShowAddWorkers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [todayPtpId, setTodayPtpId] = useState<string | null>(null);
  const [noPtpMessage, setNoPtpMessage] = useState(false);
  
  // Edit mode state
  const mode = (params.mode as string) || 'CREATE';
  const editingId = params.editingId as string | undefined;

  useEffect(() => {
    if (currentEmployee && currentProject) {
      if (mode === 'EDIT' && editingId) {
        loadExistingTimeCard();
      } else {
        loadTodaysPTP();
      }
      loadAvailableEmployees();
    }
  }, [currentEmployee, currentProject, mode, editingId]);

  const loadTodaysPTP = async () => {
    if (!currentEmployee || !currentProject) return;

    console.log('Loading today\'s PTP...');
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's PTP
      const { data: ptpData, error: ptpError } = await supabase
        .from('submitted_ptp')
        .select('id')
        .eq('project_id', currentProject.id)
        .eq('date_created', today)
        .order('submitted_time', { ascending: false })
        .limit(1)
        .single();

      if (ptpError) {
        if (ptpError.code === 'PGRST116') {
          // No PTP found for today
          console.log('No PTP found for today');
          setNoPtpMessage(true);
          setTodayPtpId(null);
          setWorkers([]);
        } else {
          console.error('Error fetching PTP:', ptpError);
          Alert.alert('Error', 'Failed to load PTP data. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (!ptpData) {
        console.log('No PTP found for today');
        setNoPtpMessage(true);
        setTodayPtpId(null);
        setWorkers([]);
        setLoading(false);
        return;
      }

      console.log('Found today\'s PTP:', ptpData.id);
      setTodayPtpId(ptpData.id);
      setNoPtpMessage(false);

      // Load workers from PTP
      const { data: ptpWorkers, error: workersError } = await supabase
        .from('submitted_ptp_workers')
        .select(`
          employee_id,
          employees:employee_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('submitted_ptp_id', ptpData.id);

      if (workersError) {
        console.error('Error fetching PTP workers:', workersError);
        Alert.alert('Error', 'Failed to load workers. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Loaded PTP workers:', ptpWorkers?.length || 0);

      // Transform workers data
      const transformedWorkers: Worker[] = (ptpWorkers || []).map((w: any) => ({
        employee_id: w.employee_id,
        name: `${w.employees.first_name} ${w.employees.last_name}`,
        hours: 8.0,
        ptpSigned: true,
      }));

      setWorkers(transformedWorkers);
    } catch (error) {
      console.error('Exception loading PTP:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingTimeCard = async () => {
    if (!currentEmployee || !currentProject || !editingId) return;

    console.log('Loading existing time card:', editingId);
    setLoading(true);

    try {
      // Load time card header
      const { data: timeCardData, error: timeCardError } = await supabase
        .from('submitted_time_cards')
        .select('id, source_ptp_id')
        .eq('id', editingId)
        .single();

      if (timeCardError) {
        console.error('Error fetching time card:', timeCardError);
        Alert.alert('Error', 'Failed to load time card. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Loaded time card:', timeCardData);
      setTodayPtpId(timeCardData.source_ptp_id);

      // Load active workers
      const { data: workersData, error: workersError } = await supabase
        .from('submitted_time_card_workers')
        .select(`
          employee_id,
          hours_worked,
          ptp_signed,
          employees:employee_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('submitted_time_card_id', editingId)
        .eq('is_active', true);

      if (workersError) {
        console.error('Error fetching workers:', workersError);
        Alert.alert('Error', 'Failed to load workers. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Loaded workers:', workersData?.length || 0);

      // Transform workers data
      const transformedWorkers: Worker[] = (workersData || []).map((w: any) => ({
        employee_id: w.employee_id,
        name: `${w.employees.first_name} ${w.employees.last_name}`,
        hours: parseFloat(w.hours_worked),
        ptpSigned: w.ptp_signed,
      }));

      setWorkers(transformedWorkers);
    } catch (error) {
      console.error('Exception loading time card:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableEmployees = async () => {
    if (!currentEmployee) return;

    console.log('Loading available employees...');

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('org_id', currentEmployee.org_id)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      const employees: AvailableEmployee[] = (data || []).map((emp) => ({
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        full_name: `${emp.first_name} ${emp.last_name}`,
      }));

      setAvailableEmployees(employees);
      console.log('Loaded available employees:', employees.length);
    } catch (error) {
      console.error('Exception loading employees:', error);
    }
  };

  const handleHoursChange = (employee_id: string, delta: number) => {
    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) => {
        if (worker.employee_id === employee_id) {
          const newHours = Math.max(0, Math.min(16, worker.hours + delta));
          return { ...worker, hours: Math.round(newHours * 2) / 2 };
        }
        return worker;
      })
    );
  };

  const addWorker = (employee: AvailableEmployee) => {
    // Check if worker already exists
    const exists = workers.some((w) => w.employee_id === employee.id);
    if (exists) {
      Alert.alert('Already Added', 'This worker is already in the list.');
      return;
    }

    const newWorker: Worker = {
      employee_id: employee.id,
      name: employee.full_name,
      hours: 8.0,
      ptpSigned: false,
    };
    setWorkers([...workers, newWorker]);
    setShowAddWorkers(false);
    setSearchQuery('');
  };

  const removeWorker = (employee_id: string) => {
    setWorkers(workers.filter((w) => w.employee_id !== employee_id));
  };

  const handleNext = () => {
    if (workers.length === 0) {
      Alert.alert('No Workers', 'Please add at least one worker before continuing.');
      return;
    }

    console.log('Navigating to Time Cards Review with workers:', workers);
    router.push({
      pathname: '/time-cards-2',
      params: {
        workers: JSON.stringify(workers),
        todayPtpId: todayPtpId || '',
        mode,
        editingId: editingId || '',
      },
    });
  };

  const filteredEmployees = availableEmployees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const alreadyAdded = workers.some((w) => w.employee_id === emp.id);
    return (
      !alreadyAdded &&
      (emp.first_name.toLowerCase().includes(query) ||
        emp.last_name.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Cards</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Time Cards {mode === 'EDIT' && '(Edit)'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {noPtpMessage && workers.length === 0 && (
          <View style={styles.warningCard}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.warningText}>
              Please complete PTP first. You can still add workers manually.
            </Text>
          </View>
        )}

        <Text style={styles.description}>
          Review today&apos;s workers and set their hours.
        </Text>

        {workers.map((worker, index) => (
          <View key={index} style={styles.workerCard}>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.statusRow}>
                <IconSymbol
                  ios_icon_name={
                    worker.ptpSigned ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'
                  }
                  android_material_icon_name={
                    worker.ptpSigned ? 'check-circle' : 'warning'
                  }
                  size={16}
                  color={worker.ptpSigned ? colors.success : colors.secondary}
                />
                <Text
                  style={[
                    styles.statusText,
                    worker.ptpSigned ? styles.statusSigned : styles.statusNotSigned,
                  ]}
                >
                  {worker.ptpSigned ? 'PTP signed' : 'PTP not signed'}
                </Text>
              </View>
            </View>

            <View style={styles.hoursControl}>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => handleHoursChange(worker.employee_id, -0.5)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="minus.circle.fill"
                  android_material_icon_name="remove-circle"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.hoursValue}>{worker.hours.toFixed(1)}</Text>

              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => handleHoursChange(worker.employee_id, 0.5)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {!worker.ptpSigned && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeWorker(worker.employee_id)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {availableEmployees.length > 0 && (
          <View style={styles.addWorkersSection}>
            <TouchableOpacity
              style={styles.addWorkersButton}
              onPress={() => setShowAddWorkers(!showAddWorkers)}
              activeOpacity={0.7}
            >
              <Text style={styles.addWorkersButtonText}>
                {showAddWorkers ? 'Hide available workers' : 'Add workers'}
              </Text>
              <IconSymbol
                ios_icon_name={showAddWorkers ? 'chevron.up' : 'chevron.down'}
                android_material_icon_name={
                  showAddWorkers ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {showAddWorkers && (
              <View style={styles.availableWorkersContainer}>
                <Text style={styles.availableWorkersTitle}>
                  Available Workers
                </Text>
                
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search workers..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                <ScrollView style={styles.workersList} nestedScrollEnabled>
                  {filteredEmployees.length === 0 ? (
                    <Text style={styles.noResultsText}>
                      {searchQuery ? 'No workers found' : 'All workers have been added'}
                    </Text>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.availableWorkerBox}
                        onPress={() => addWorker(employee)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.availableWorkerName}>{employee.full_name}</Text>
                        <IconSymbol
                          ios_icon_name="plus.circle"
                          android_material_icon_name="add-circle-outline"
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  warningCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontWeight: '500',
  },
  workerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSigned: {
    color: colors.success,
  },
  statusNotSigned: {
    color: colors.secondary,
  },
  hoursControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hoursButton: {
    padding: 4,
  },
  hoursValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addWorkersSection: {
    marginTop: 20,
  },
  addWorkersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addWorkersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  availableWorkersContainer: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  availableWorkersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workersList: {
    maxHeight: 300,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  availableWorkerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  availableWorkerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
