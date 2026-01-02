
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

type DumpsterType = '10 Yard' | '20 Yard' | '30 Yard' | '40 Yard';

interface DumpsterData {
  quantity: number;
  extraWork: boolean;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<DumpsterType, DumpsterData>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: { marginRight: 12 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  companyInfo: {
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dumpsterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dumpsterType: {
    fontSize: 14,
    color: colors.text,
  },
  dumpsterQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  extraWorkNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  addressSection: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  addressDisplay: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [projectAddress, setProjectAddress] = useState(
    currentProject?.location || ''
  );
  const [tempAddress, setTempAddress] = useState(projectAddress);
  const [submitting, setSubmitting] = useState(false);

  const addQuantities: DumpsterQuantities = params.addQuantities
    ? JSON.parse(params.addQuantities as string)
    : {};
  const replaceQuantities: DumpsterQuantities = params.replaceQuantities
    ? JSON.parse(params.replaceQuantities as string)
    : {};

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getUserName = () => {
    if (!currentEmployee) return 'Unknown';
    return `${currentEmployee.first_name} ${currentEmployee.last_name}`;
  };

  const handleEditAddress = () => {
    setTempAddress(projectAddress);
    setIsEditingAddress(true);
  };

  const handleConfirmAddress = () => {
    setProjectAddress(tempAddress);
    setIsEditingAddress(false);
  };

  const handleCancelAddress = () => {
    setTempAddress(projectAddress);
    setIsEditingAddress(false);
  };

  const renderDumpsterList = (
    quantities: DumpsterQuantities,
    title: string
  ) => {
    const items = Object.entries(quantities).filter(
      ([_, data]) => data.quantity > 0
    );

    if (items.length === 0) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(([type, data]) => (
          <View key={type}>
            <View style={styles.dumpsterRow}>
              <Text style={styles.dumpsterType}>{type}</Text>
              <Text style={styles.dumpsterQuantity}>{data.quantity}</Text>
            </View>
            {data.extraWork && data.extraWorkQuantity > 0 && (
              <Text style={styles.extraWorkNote}>
                {data.extraWorkQuantity} for extra work
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!currentEmployee || !currentProject) {
      Alert.alert('Error', 'Missing employee or project information');
      return;
    }

    if (!projectAddress.trim()) {
      Alert.alert('Required', 'Please provide a project address');
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Backend Integration - Call the submit-hauling-request Edge Function with extended payload
      const { data, error } = await supabase.functions.invoke(
        'submit-hauling-request',
        {
          body: {
            org_id: currentEmployee.org_id,
            project_id: currentProject.id,
            submitted_by_employee_id: currentEmployee.id,
            project_address: projectAddress,
            hauling_company_id: params.companyId,
            hauling_company: {
              name: params.companyName,
              contact_name: params.companyContactName,
              phone_number: params.companyPhone,
              email: params.companyEmail,
            },
            add_dumpsters: addQuantities,
            replace_dumpsters: replaceQuantities,
          },
        }
      );

      if (error) throw error;

      Alert.alert('Success', 'Hauling request submitted successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/(home)'),
        },
      ]);
    } catch (error) {
      console.error('Error submitting hauling request:', error);
      Alert.alert('Error', 'Failed to submit hauling request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Summary</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hauling Company</Text>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{params.companyName}</Text>
            <Text style={styles.companyDetail}>
              Contact: {params.companyContactName}
            </Text>
            <Text style={styles.companyDetail}>
              Phone: {params.companyPhone}
            </Text>
            <Text style={styles.companyDetail}>
              Email: {params.companyEmail}
            </Text>
          </View>
        </View>

        {renderDumpsterList(addQuantities, 'Add Dumpsters')}
        {renderDumpsterList(replaceQuantities, 'Replace Dumpsters')}

        <View style={styles.card}>
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Project Address</Text>
            {isEditingAddress ? (
              <>
                <TextInput
                  style={styles.input}
                  value={tempAddress}
                  onChangeText={setTempAddress}
                  placeholder="Enter project address"
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelAddress}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmAddress}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.addressDisplay}>{projectAddress}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditAddress}
                >
                  <Text style={styles.editButtonText}>Edit Address</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.metaText}>Submitted by: {getUserName()}</Text>
          <Text style={styles.metaText}>Time: {getCurrentTime()}</Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
