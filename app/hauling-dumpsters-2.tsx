
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/lib/supabase';

type DumpsterType = 'Rubbish' | 'Heavy' | 'Concrete' | 'Scrap' | 'ACM' | 'Lead';

interface DumpsterData {
  quantity: number;
  extraWorkAnswer: 'yes' | 'no' | null;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<DumpsterType, DumpsterData>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dumpsterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dumpsterName: {
    fontSize: 15,
    color: colors.text,
  },
  dumpsterQuantity: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  extraWorkBadge: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 8,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 50,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const haulingCompanyId = params.haulingCompanyId as string;
  const haulingCompanyName = params.haulingCompanyName as string;
  const haulingCompanyPhone = params.haulingCompanyPhone as string;
  const haulingCompanyEmail = params.haulingCompanyEmail as string;
  const haulingCompanyContact = params.haulingCompanyContact as string;
  
  const addDumpsters: DumpsterQuantities = JSON.parse(params.addDumpsters as string);
  const replaceDumpsters: DumpsterQuantities = JSON.parse(params.replaceDumpsters as string);

  useEffect(() => {
    if (currentProject?.address || currentProject?.location) {
      setAddress(currentProject.address || currentProject.location || '');
    }
  }, [currentProject]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSubmit = async () => {
    if (!currentEmployee || !currentProject) {
      Alert.alert('Error', 'Missing employee or project information');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a project address');
      return;
    }

    setLoading(true);

    try {
      // Build add_dumpsters and replace_dumpsters arrays for Edge Function
      const add_dumpsters = Object.entries(addDumpsters)
        .filter(([_, data]) => data.quantity > 0)
        .map(([type, data]) => ({
          dumpster_type: type,
          quantity: data.quantity,
          extra_work_quantity: data.extraWorkAnswer === 'yes' ? data.extraWorkQuantity : 0,
        }));

      const replace_dumpsters = Object.entries(replaceDumpsters)
        .filter(([_, data]) => data.quantity > 0)
        .map(([type, data]) => ({
          dumpster_type: type,
          quantity: data.quantity,
          extra_work_quantity: data.extraWorkAnswer === 'yes' ? data.extraWorkQuantity : 0,
        }));

      console.log('Submitting hauling request via Edge Function');
      console.log('Add dumpsters:', add_dumpsters);
      console.log('Replace dumpsters:', replace_dumpsters);

      // Call the Edge Function - it will handle ALL database operations
      // The Edge Function derives org_id and submitted_by_employee_id from the authenticated user
      const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
        'submit-hauling-request',
        {
          body: {
            project_id: currentProject.id,
            project_address: address,
            hauling_company_id: haulingCompanyId,
            add_dumpsters: add_dumpsters,
            replace_dumpsters: replace_dumpsters,
          },
        }
      );

      if (edgeFunctionError) {
        console.error('Edge function error:', edgeFunctionError);
        Alert.alert('Error', `Failed to submit hauling request: ${edgeFunctionError.message}`);
        setLoading(false);
        return;
      }

      console.log('Edge function response:', response);

      if (response?.success) {
        Alert.alert('Success', 'Hauling request submitted successfully', [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/(home)'),
          },
        ]);
      } else {
        Alert.alert('Warning', 'Hauling request may not have been sent. Please check with your manager.');
        router.push('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Exception submitting hauling request:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderDumpsterList = (dumpsters: DumpsterQuantities, title: string) => {
    const hasAnyQuantity = Object.values(dumpsters).some((d) => d.quantity > 0);
    
    if (!hasAnyQuantity) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.card}>
          {Object.entries(dumpsters).map(([type, data]) => {
            if (data.quantity === 0) return null;
            return (
              <View key={type} style={styles.dumpsterRow}>
                <Text style={styles.dumpsterName}>{type}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.dumpsterQuantity}>{data.quantity}</Text>
                  {data.extraWorkAnswer === 'yes' && (
                    <Text style={styles.extraWorkBadge}>
                      ({data.extraWorkQuantity} extra work)
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Summary</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Hauling Company</Text>
              <Text style={styles.value}>{haulingCompanyName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Submitted By</Text>
              <Text style={styles.value}>
                {currentEmployee?.first_name} {currentEmployee?.last_name}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{getCurrentDate()}</Text>
            </View>
            <View style={[styles.row, { marginBottom: 0 }]}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{getCurrentTime()}</Text>
            </View>
          </View>
        </View>

        {renderDumpsterList(addDumpsters, 'Add Dumpsters')}
        {renderDumpsterList(replaceDumpsters, 'Replace Dumpsters')}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Address</Text>
          {!isEditingAddress ? (
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <Text style={styles.addressText}>{address || 'No address set'}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingAddress(true)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.addressContainer}>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter project address"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <TouchableOpacity
                style={[styles.editButton, { marginTop: 8, alignSelf: 'flex-end' }]}
                onPress={() => setIsEditingAddress(false)}
              >
                <Text style={styles.editButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
