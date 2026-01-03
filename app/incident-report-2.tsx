
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import SearchableDropdown from '@/components/SearchableDropdown';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  employeeList: {
    marginTop: 12,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  employeeItemSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  employeeName: {
    fontSize: 15,
    color: colors.text,
  },
  subcontractorEntry: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subcontractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subcontractorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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

  const [employeeInjured, setEmployeeInjured] = useState<'yes' | 'no' | null>(
    params.employeeInjured ? (params.employeeInjured as 'yes' | 'no') : null
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    params.selectedEmployees ? JSON.parse(params.selectedEmployees as string) : []
  );

  const [subcontractorInjured, setSubcontractorInjured] = useState<'yes' | 'no' | null>(
    params.subcontractorInjured ? (params.subcontractorInjured as 'yes' | 'no') : null
  );
  const [subcontractorEntries, setSubcontractorEntries] = useState<SubcontractorEntry[]>(
    params.subcontractorEntries ? JSON.parse(params.subcontractorEntries as string) : []
  );

  const [otherInjured, setOtherInjured] = useState<'yes' | 'no' | null>(
    params.otherInjured ? (params.otherInjured as 'yes' | 'no') : null
  );
  const [otherInjuredEntries, setOtherInjuredEntries] = useState<OtherInjuredEntry[]>(
    params.otherInjuredEntries ? JSON.parse(params.otherInjuredEntries as string) : []
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSubcontractors, setLoadingSubcontractors] = useState(false);

  // Fetch employees when component mounts
  useEffect(() => {
    if (currentEmployee?.org_id) {
      fetchEmployees();
    }
  }, [currentEmployee?.org_id]);

  // Fetch subcontractors when toggle is set to Yes
  useEffect(() => {
    if (subcontractorInjured === 'yes' && currentEmployee?.org_id) {
      fetchSubcontractors();
    }
  }, [subcontractorInjured, currentEmployee?.org_id]);

  const fetchEmployees = async () => {
    if (!currentEmployee?.org_id) return;

    setLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('org_id', currentEmployee.org_id)
        .order('first_name');

      if (error) throw error;

      const formattedEmployees = (data || []).map((emp) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
      }));

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchSubcontractors = async () => {
    if (!currentEmployee?.org_id) return;

    setLoadingSubcontractors(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('id, name')
        .eq('org_id', currentEmployee.org_id)
        .order('name');

      if (error) throw error;

      setSubcontractors(data || []);
    } catch (error) {
      console.error('Error fetching subcontractors:', error);
    } finally {
      setLoadingSubcontractors(false);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || employeeId;
  };

  const addSubcontractor = () => {
    const newEntry: SubcontractorEntry = {
      id: Date.now().toString(),
      company: '',
      companyId: '',
      workerNames: '',
    };
    setSubcontractorEntries([...subcontractorEntries, newEntry]);
  };

  const updateSubcontractorCompany = (id: string, companyId: string) => {
    setSubcontractorEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, companyId, company: subcontractors.find((s) => s.id === companyId)?.name || '' }
          : entry
      )
    );
  };

  const updateSubcontractorWorkers = (id: string, workerNames: string) => {
    setSubcontractorEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, workerNames } : entry))
    );
  };

  const removeSubcontractor = (id: string) => {
    setSubcontractorEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addOtherInjured = () => {
    const newEntry: OtherInjuredEntry = {
      id: Date.now().toString(),
      name: '',
    };
    setOtherInjuredEntries([...otherInjuredEntries, newEntry]);
  };

  const updateOtherInjured = (id: string, name: string) => {
    setOtherInjuredEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, name } : entry))
    );
  };

  const removeOtherInjured = (id: string) => {
    setOtherInjuredEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-3',
      params: {
        ...params,
        employeeInjured,
        selectedEmployees: JSON.stringify(selectedEmployees),
        subcontractorInjured,
        subcontractorEntries: JSON.stringify(subcontractorEntries),
        otherInjured,
        otherInjuredEntries: JSON.stringify(otherInjuredEntries),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Injured People</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Page 2 of 5</Text>

        {/* Employee Injured */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Was an employee injured?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                employeeInjured === 'yes' && styles.toggleButtonActive,
              ]}
              onPress={() => setEmployeeInjured('yes')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  employeeInjured === 'yes' && styles.toggleButtonTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                employeeInjured === 'no' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setEmployeeInjured('no');
                setSelectedEmployees([]);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  employeeInjured === 'no' && styles.toggleButtonTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {employeeInjured === 'yes' && (
            <View style={styles.employeeList}>
              {loadingEmployees ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                employees.map((employee) => (
                  <TouchableOpacity
                    key={employee.id}
                    style={[
                      styles.employeeItem,
                      selectedEmployees.includes(employee.id) && styles.employeeItemSelected,
                    ]}
                    onPress={() => toggleEmployee(employee.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedEmployees.includes(employee.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedEmployees.includes(employee.id) && (
                        <IconSymbol name="checkmark" size={16} color={colors.white} />
                      )}
                    </View>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Subcontractor Injured */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Was a subcontractor injured?</Text>
          <View style={styles.toggleContainer}>
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

          {subcontractorInjured === 'yes' && (
            <>
              {loadingSubcontractors ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <>
                  {subcontractorEntries.map((entry) => (
                    <View key={entry.id} style={styles.subcontractorEntry}>
                      <View style={styles.subcontractorHeader}>
                        <Text style={styles.subcontractorLabel}>Subcontractor</Text>
                        <TouchableOpacity
                          onPress={() => removeSubcontractor(entry.id)}
                          style={styles.removeButton}
                        >
                          <IconSymbol name="trash" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>

                      <SearchableDropdown
                        options={subcontractors.map((s) => ({
                          label: s.name,
                          value: s.id,
                        }))}
                        selectedValue={entry.companyId}
                        onSelect={(value) => updateSubcontractorCompany(entry.id, value)}
                        placeholder="Select subcontractor"
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Worker names (comma separated)"
                        value={entry.workerNames}
                        onChangeText={(text) => updateSubcontractorWorkers(entry.id, text)}
                        multiline
                      />
                    </View>
                  ))}

                  <TouchableOpacity style={styles.addButton} onPress={addSubcontractor}>
                    <IconSymbol name="plus" size={20} color={colors.primary} />
                    <Text style={styles.addButtonText}>Add Another Subcontractor</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        {/* Other Injured */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Was anyone else injured?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                otherInjured === 'yes' && styles.toggleButtonActive,
              ]}
              onPress={() => setOtherInjured('yes')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  otherInjured === 'yes' && styles.toggleButtonTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                otherInjured === 'no' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setOtherInjured('no');
                setOtherInjuredEntries([]);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  otherInjured === 'no' && styles.toggleButtonTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {otherInjured === 'yes' && (
            <>
              {otherInjuredEntries.map((entry) => (
                <View key={entry.id} style={styles.subcontractorEntry}>
                  <View style={styles.subcontractorHeader}>
                    <Text style={styles.subcontractorLabel}>Other Person</Text>
                    <TouchableOpacity
                      onPress={() => removeOtherInjured(entry.id)}
                      style={styles.removeButton}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={entry.name}
                    onChangeText={(text) => updateOtherInjured(entry.id, text)}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addOtherInjured}>
                <IconSymbol name="plus" size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Another Person</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
