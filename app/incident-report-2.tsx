
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import SearchableDropdown from '@/components/SearchableDropdown';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  radioButtonTextSelected: {
    color: colors.white,
  },
  selectedList: {
    marginTop: 12,
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedItemText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 4,
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
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  entryCard: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
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
  const { currentEmployee } = useAuth();

  // Parse incoming data
  const [employeeInjured, setEmployeeInjured] = useState<'yes' | 'no' | null>(
    params.employeeInjured ? (params.employeeInjured as 'yes' | 'no') : null
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    params.selectedEmployees ? JSON.parse(params.selectedEmployees as string) : []
  );
  const [subcontractorInjured, setSubcontractorInjured] = useState<'yes' | 'no' | null>(
    params.subcontractorInjured ? (params.subcontractorInjured as 'yes' | 'no') : null
  );
  const [subcontractors, setSubcontractors] = useState<SubcontractorEntry[]>(
    params.subcontractors ? JSON.parse(params.subcontractors as string) : []
  );
  const [otherInjured, setOtherInjured] = useState<'yes' | 'no' | null>(
    params.otherInjured ? (params.otherInjured as 'yes' | 'no') : null
  );
  const [otherInjuredList, setOtherInjuredList] = useState<OtherInjuredEntry[]>(
    params.otherInjuredList ? JSON.parse(params.otherInjuredList as string) : []
  );

  // Data from Supabase
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [subcontractorOptions, setSubcontractorOptions] = useState<Subcontractor[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSubcontractors, setLoadingSubcontractors] = useState(false);

  // Fetch employees
  useEffect(() => {
    if (currentEmployee?.org_id) {
      fetchEmployees();
    }
  }, [currentEmployee?.org_id]);

  // Fetch subcontractors when needed
  useEffect(() => {
    if (subcontractorInjured === 'yes' && currentEmployee?.org_id) {
      fetchSubcontractors();
    }
  }, [subcontractorInjured, currentEmployee?.org_id]);

  async function fetchEmployees() {
    setLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('org_id', currentEmployee!.org_id);

      if (error) throw error;

      const formatted = (data || []).map((emp) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
      }));

      setEmployees(formatted);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function fetchSubcontractors() {
    setLoadingSubcontractors(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('id, name')
        .eq('org_id', currentEmployee!.org_id);

      if (error) throw error;

      setSubcontractorOptions(data || []);
    } catch (error) {
      console.error('Error fetching subcontractors:', error);
    } finally {
      setLoadingSubcontractors(false);
    }
  }

  function toggleEmployee(employeeId: string) {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  }

  function getEmployeeName(employeeId: string): string {
    return employees.find((e) => e.id === employeeId)?.name || 'Unknown Employee';
  }

  function addSubcontractor() {
    const newEntry: SubcontractorEntry = {
      id: Date.now().toString(),
      company: '',
      companyId: '',
      workerNames: '',
    };
    setSubcontractors((prev) => [...prev, newEntry]);
  }

  function updateSubcontractorCompany(id: string, companyId: string) {
    setSubcontractors((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              companyId,
              company: subcontractorOptions.find((s) => s.id === companyId)?.name || '',
            }
          : sub
      )
    );
  }

  function updateSubcontractorWorkers(id: string, workerNames: string) {
    setSubcontractors((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, workerNames } : sub))
    );
  }

  function removeSubcontractor(id: string) {
    setSubcontractors((prev) => prev.filter((sub) => sub.id !== id));
  }

  function addOtherInjured() {
    const newEntry: OtherInjuredEntry = {
      id: Date.now().toString(),
      name: '',
    };
    setOtherInjuredList((prev) => [...prev, newEntry]);
  }

  function updateOtherInjured(id: string, name: string) {
    setOtherInjuredList((prev) =>
      prev.map((other) => (other.id === id ? { ...other, name } : other))
    );
  }

  function removeOtherInjured(id: string) {
    setOtherInjuredList((prev) => prev.filter((other) => other.id !== id));
  }

  function handleNext() {
    router.push({
      pathname: '/incident-report-3',
      params: {
        ...params,
        employeeInjured,
        selectedEmployees: JSON.stringify(selectedEmployees),
        subcontractorInjured,
        subcontractors: JSON.stringify(subcontractors),
        otherInjured,
        otherInjuredList: JSON.stringify(otherInjuredList),
      },
    });
  }

  function handleBack() {
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
        {/* Employee Injured */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was an employee injured?</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                employeeInjured === 'yes' && styles.radioButtonSelected,
              ]}
              onPress={() => setEmployeeInjured('yes')}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  employeeInjured === 'yes' && styles.radioButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                employeeInjured === 'no' && styles.radioButtonSelected,
              ]}
              onPress={() => {
                setEmployeeInjured('no');
                setSelectedEmployees([]);
              }}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  employeeInjured === 'no' && styles.radioButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {employeeInjured === 'yes' && (
            <>
              {loadingEmployees ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <>
                  <SearchableDropdown
                    data={employees.map((emp) => ({ label: emp.name, value: emp.id }))}
                    placeholder="Select employees"
                    onSelect={(value) => toggleEmployee(value)}
                    selectedValue={null}
                    multiSelect={true}
                    selectedValues={selectedEmployees}
                  />
                  {selectedEmployees.length > 0 && (
                    <View style={styles.selectedList}>
                      {selectedEmployees.map((empId) => (
                        <View key={empId} style={styles.selectedItem}>
                          <Text style={styles.selectedItemText}>{getEmployeeName(empId)}</Text>
                          <TouchableOpacity
                            onPress={() => toggleEmployee(empId)}
                            style={styles.removeButton}
                          >
                            <IconSymbol 
                              ios_icon_name="xmark.circle.fill" 
                              android_material_icon_name="cancel" 
                              size={20} 
                              color={colors.error} 
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* Subcontractor Injured */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was a subcontractor injured?</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                subcontractorInjured === 'yes' && styles.radioButtonSelected,
              ]}
              onPress={() => setSubcontractorInjured('yes')}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  subcontractorInjured === 'yes' && styles.radioButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                subcontractorInjured === 'no' && styles.radioButtonSelected,
              ]}
              onPress={() => {
                setSubcontractorInjured('no');
                setSubcontractors([]);
              }}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  subcontractorInjured === 'no' && styles.radioButtonTextSelected,
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
                  {subcontractors.map((sub) => (
                    <View key={sub.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>Subcontractor</Text>
                        <TouchableOpacity onPress={() => removeSubcontractor(sub.id)}>
                          <IconSymbol 
                            ios_icon_name="trash" 
                            android_material_icon_name="delete" 
                            size={20} 
                            color={colors.error} 
                          />
                        </TouchableOpacity>
                      </View>
                      <SearchableDropdown
                        data={subcontractorOptions.map((s) => ({ label: s.name, value: s.id }))}
                        placeholder="Select subcontractor company"
                        onSelect={(value) => updateSubcontractorCompany(sub.id, value)}
                        selectedValue={sub.companyId || null}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Names of injured workers"
                        value={sub.workerNames}
                        onChangeText={(text) => updateSubcontractorWorkers(sub.id, text)}
                      />
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addButton} onPress={addSubcontractor}>
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add-circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.addButtonText}>Add another subcontractor</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        {/* Other Injured */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was anyone else injured?</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                otherInjured === 'yes' && styles.radioButtonSelected,
              ]}
              onPress={() => setOtherInjured('yes')}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  otherInjured === 'yes' && styles.radioButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                otherInjured === 'no' && styles.radioButtonSelected,
              ]}
              onPress={() => {
                setOtherInjured('no');
                setOtherInjuredList([]);
              }}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  otherInjured === 'no' && styles.radioButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {otherInjured === 'yes' && (
            <>
              {otherInjuredList.map((other) => (
                <View key={other.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>Other Injured Person</Text>
                    <TouchableOpacity onPress={() => removeOtherInjured(other.id)}>
                      <IconSymbol 
                        ios_icon_name="trash" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={other.name}
                    onChangeText={(text) => updateOtherInjured(other.id, text)}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addOtherInjured}>
                <IconSymbol 
                  ios_icon_name="plus.circle.fill" 
                  android_material_icon_name="add-circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.addButtonText}>Add another person</Text>
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
