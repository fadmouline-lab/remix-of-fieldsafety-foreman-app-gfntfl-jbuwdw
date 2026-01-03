
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SearchableDropdown from '@/components/SearchableDropdown';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface SubcontractorEntry {
  id: string;
  company: string;
  companyId: string;
  workerNames: string;
}

interface OtherInjuredEntry {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Subcontractor {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default function IncidentReportPage2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    params.selectedEmployees ? JSON.parse(params.selectedEmployees as string) : []
  );
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // State for subcontractors
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loadingSubcontractors, setLoadingSubcontractors] = useState(false);
  const [subcontractorInjured, setSubcontractorInjured] = useState<'yes' | 'no' | null>(
    params.subcontractorInjured ? (params.subcontractorInjured as 'yes' | 'no') : null
  );
  const [subcontractorEntries, setSubcontractorEntries] = useState<SubcontractorEntry[]>(
    params.subcontractors ? JSON.parse(params.subcontractors as string) : []
  );

  // State for other injured
  const [otherInjured, setOtherInjured] = useState<OtherInjuredEntry[]>(
    params.otherInjured ? JSON.parse(params.otherInjured as string) : [{ id: '1', name: '' }]
  );

  // Fetch employees from Supabase
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

  // Fetch subcontractors when user selects "Yes" for subcontractor injured
  useEffect(() => {
    const fetchSubcontractors = async () => {
      if (subcontractorInjured !== 'yes' || !currentProject?.id || !currentEmployee?.org_id) {
        return;
      }

      setLoadingSubcontractors(true);
      try {
        // Fetch subcontractors assigned to the current project
        const { data, error } = await supabase
          .from('project_subcontractors')
          .select(`
            subcontractor_id,
            subcontractors!inner (
              id,
              name
            )
          `)
          .eq('project_id', currentProject.id)
          .eq('org_id', currentEmployee.org_id);

        if (error) {
          console.error('Error fetching subcontractors:', error);
        } else {
          const formattedSubcontractors = (data || []).map((ps: any) => ({
            id: ps.subcontractors.id,
            name: ps.subcontractors.name,
          }));
          setSubcontractors(formattedSubcontractors);
        }
      } catch (error) {
        console.error('Exception fetching subcontractors:', error);
      } finally {
        setLoadingSubcontractors(false);
      }
    };

    fetchSubcontractors();
  }, [subcontractorInjured, currentProject?.id, currentEmployee?.org_id]);

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || employeeId;
  };

  const addSubcontractor = () => {
    setSubcontractorEntries([
      ...subcontractorEntries,
      { id: Date.now().toString(), company: '', companyId: '', workerNames: '' },
    ]);
  };

  const updateSubcontractorCompany = (id: string, companyId: string) => {
    const subcontractor = subcontractors.find((s) => s.id === companyId);
    setSubcontractorEntries(
      subcontractorEntries.map((s) =>
        s.id === id ? { ...s, companyId, company: subcontractor?.name || '' } : s
      )
    );
  };

  const updateSubcontractorWorkers = (id: string, workerNames: string) => {
    setSubcontractorEntries(
      subcontractorEntries.map((s) => (s.id === id ? { ...s, workerNames } : s))
    );
  };

  const removeSubcontractor = (id: string) => {
    setSubcontractorEntries(subcontractorEntries.filter((s) => s.id !== id));
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
        employees: JSON.stringify(employees), // Pass full employees array
        subcontractorInjured: subcontractorInjured || '',
        subcontractors: JSON.stringify(subcontractorEntries),
        subcontractorsList: JSON.stringify(subcontractors), // Pass full subcontractors array
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
              {selectedEmployees.map((empId) => (
                <View key={empId} style={styles.chip}>
                  <Text style={styles.chipText}>{getEmployeeName(empId)}</Text>
                  <TouchableOpacity onPress={() => toggleEmployee(empId)}>
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
                  setSubcontractorEntries([]);
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
              {loadingSubcontractors ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 8 }}>
                    Loading subcontractors...
                  </Text>
                </View>
              ) : (
                <>
                  {subcontractorEntries.map((sub) => (
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
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => {
                          // Show subcontractor picker
                          // For simplicity, using a simple text input here
                          // In production, you'd use another SearchableDropdown
                        }}
                      >
                        <Text style={styles.dropdownButtonText}>
                          {sub.company || 'Select from list...'}
                        </Text>
                        <IconSymbol
                          ios_icon_name="chevron.down"
                          android_material_icon_name="arrow-drop-down"
                          size={20}
                          color={colors.text}
                        />
                      </TouchableOpacity>
                      <Text style={[styles.label, { marginTop: 12 }]}>
                        Name of injured subcontractor worker(s)
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter names..."
                        placeholderTextColor={colors.text + '80'}
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
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Other injured person (if not listed above)</Text>
          {otherInjured.map((entry) => (
            <View key={entry.id} style={styles.otherInjuredRow}>
              <TextInput
                style={styles.otherInjuredInput}
                placeholder="Enter name..."
                placeholderTextColor={colors.text + '80'}
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

      <SearchableDropdown
        visible={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title="Select Employees"
        items={employees}
        selectedIds={selectedEmployees}
        onToggleItem={toggleEmployee}
        multiSelect={true}
        loading={loadingEmployees}
        initialLimit={20}
      />
    </View>
  );
}
