
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DumpsterItem {
  dumpster_type: string;
  quantity: number;
  extra_work_quantity: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  dumpsterItem: {
    marginBottom: 16,
  },
  dumpsterType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dumpsterDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentProject, currentEmployee } = useAuth();
  const [loading, setLoading] = useState(false);

  const haulingCompanyId = params.haulingCompanyId as string;
  const haulingCompanyName = params.haulingCompanyName as string;
  const haulingCompanyPhone = params.haulingCompanyPhone as string;
  const haulingCompanyEmail = params.haulingCompanyEmail as string;
  const haulingCompanyContact = params.haulingCompanyContact as string;

  const addDumpstersRaw = params.addDumpsters as string;
  const replaceDumpstersRaw = params.replaceDumpsters as string;

  const addDumpsters: DumpsterItem[] = addDumpstersRaw ? JSON.parse(addDumpstersRaw) : [];
  const replaceDumpsters: DumpsterItem[] = replaceDumpstersRaw ? JSON.parse(replaceDumpstersRaw) : [];

  const handleSubmit = async () => {
    // Guard against double submits
    if (loading) {
      console.log('Already submitting, ignoring duplicate submit');
      return;
    }

    if (!currentProject || !currentEmployee) {
      Alert.alert('Error', 'Missing project or employee information');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting hauling request...');

      // TODO: Backend Integration - Submit hauling request to Edge Function
      const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
        'submit-hauling-request',
        {
          body: {
            project_id: currentProject.id,
            project_address: currentProject.address || 'N/A',
            hauling_company_id: haulingCompanyId,
            hauling_company_name: haulingCompanyName,
            hauling_company_phone: haulingCompanyPhone || '',
            hauling_company_email: haulingCompanyEmail || '',
            hauling_company_contact: haulingCompanyContact || '',
            add_dumpsters: addDumpsters,
            replace_dumpsters: replaceDumpsters,
          },
        }
      );

      if (edgeFunctionError) {
        console.error('Edge function error:', edgeFunctionError);
        Alert.alert('Error', 'Failed to submit hauling request. Please try again.');
        return;
      }

      console.log('Edge function response:', response);

      if (response?.success) {
        // Immediately redirect to dashboard on success
        console.log('Submission successful, redirecting to dashboard');
        router.replace('/(tabs)/(home)');
      } else {
        // Show warning but still redirect
        Alert.alert(
          'Warning',
          response?.message || 'Request submitted but webhook notification may have failed.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/(home)'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Exception during submission:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Summary</Text>
        </View>

        {/* Request Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hauling Company:</Text>
            <Text style={styles.infoValue}>{haulingCompanyName}</Text>
          </View>
          {haulingCompanyContact && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{haulingCompanyContact}</Text>
            </View>
          )}
          {haulingCompanyPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{haulingCompanyPhone}</Text>
            </View>
          )}
          {haulingCompanyEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{haulingCompanyEmail}</Text>
            </View>
          )}
        </View>

        {/* Add Dumpsters Section */}
        {addDumpsters.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Add Dumpsters</Text>
            {addDumpsters.map((item, index) => (
              <View key={index} style={styles.dumpsterItem}>
                <Text style={styles.dumpsterType}>{item.dumpster_type}</Text>
                <Text style={styles.dumpsterDetail}>Total Quantity: {item.quantity}</Text>
                {item.extra_work_quantity > 0 && (
                  <Text style={styles.dumpsterDetail}>
                    Extra Work: {item.extra_work_quantity}
                  </Text>
                )}
                {item.extra_work_quantity > 0 && (
                  <Text style={styles.dumpsterDetail}>
                    Normal Work: {item.quantity - item.extra_work_quantity}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Replace Dumpsters Section */}
        {replaceDumpsters.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Replace Dumpsters</Text>
            {replaceDumpsters.map((item, index) => (
              <View key={index} style={styles.dumpsterItem}>
                <Text style={styles.dumpsterType}>{item.dumpster_type}</Text>
                <Text style={styles.dumpsterDetail}>Total Quantity: {item.quantity}</Text>
                {item.extra_work_quantity > 0 && (
                  <Text style={styles.dumpsterDetail}>
                    Extra Work: {item.extra_work_quantity}
                  </Text>
                )}
                {item.extra_work_quantity > 0 && (
                  <Text style={styles.dumpsterDetail}>
                    Normal Work: {item.quantity - item.extra_work_quantity}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Project Address Section */}
        {currentProject?.address && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Project Address</Text>
            <Text style={styles.infoValue}>{currentProject.address}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.submitButtonText}>SUBMITTING...</Text>
            </>
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
