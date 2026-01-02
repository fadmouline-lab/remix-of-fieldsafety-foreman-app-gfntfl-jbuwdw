
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
import React, { useState, useEffect } from 'react';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DumpsterData {
  quantity: number;
  extraWorkAnswer: 'yes' | 'no' | null;
  extraWorkQuantity: number;
}

type DumpsterType = '10 Yard' | '20 Yard' | '30 Yard' | '40 Yard';

const DUMPSTER_TYPES: DumpsterType[] = ['10 Yard', '20 Yard', '30 Yard', '40 Yard'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dumpsterItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dumpsterItemLast: {
    borderBottomWidth: 0,
  },
  dumpsterType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dumpsterDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentProject } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (params.selectedCompanyId && params.selectedCompanyName) {
      setSelectedCompany({
        id: params.selectedCompanyId,
        name: params.selectedCompanyName,
      });
    }
    if (params.address) {
      setAddress(params.address as string);
    }
  }, [params]);

  const addDumpsters = params.addDumpsters ? JSON.parse(params.addDumpsters as string) : {};
  const replaceDumpsters = params.replaceDumpsters ? JSON.parse(params.replaceDumpsters as string) : {};

  const addDumpstersList = DUMPSTER_TYPES.filter(type => addDumpsters[type]?.quantity > 0);
  const replaceDumpstersList = DUMPSTER_TYPES.filter(type => replaceDumpsters[type]?.quantity > 0);

  const handleSubmit = async () => {
    if (loading) {
      console.log('Submit already in progress, ignoring duplicate request');
      return;
    }

    setLoading(true);

    try {
      const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
        'submit-hauling-request',
        {
          body: {
            project_id: currentProject?.id,
            project_address: address,
            hauling_company_id: selectedCompany?.id,
            add_dumpsters: addDumpsters,
            replace_dumpsters: replaceDumpsters,
          },
        }
      );

      if (edgeFunctionError) {
        console.log('Edge function error:', edgeFunctionError);
        Alert.alert('Submission Error', edgeFunctionError.message);
        return;
      }

      if (response?.success) {
        console.log('Hauling request submitted successfully');
        // Navigate immediately on success without showing confirmation
        router.replace('/(tabs)/(home)');
      } else {
        console.log('Submission warning:', response?.message);
        Alert.alert('Submission Warning', response?.message || 'Unknown warning');
        router.replace('/(tabs)/(home)');
      }
    } catch (error: any) {
      console.log('Unexpected error during submission:', error);
      Alert.alert('Unexpected Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Summary</Text>
          <Text style={styles.subtitle}>Review your hauling request</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Hauling Company</Text>
            <Text style={styles.value}>{selectedCompany?.name || 'N/A'}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Project Address</Text>
            <Text style={styles.value}>{address || 'N/A'}</Text>
          </View>
        </View>

        {addDumpstersList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Dumpsters</Text>
            {addDumpstersList.map((type, index) => {
              const data = addDumpsters[type];
              return (
                <View
                  key={type}
                  style={[
                    styles.dumpsterItem,
                    index === addDumpstersList.length - 1 && styles.dumpsterItemLast,
                  ]}
                >
                  <Text style={styles.dumpsterType}>{type}</Text>
                  <Text style={styles.dumpsterDetail}>Quantity: {data.quantity}</Text>
                  {data.extraWorkQuantity > 0 && (
                    <Text style={styles.dumpsterDetail}>
                      Extra Work: {data.extraWorkQuantity}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {replaceDumpstersList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Replace Dumpsters</Text>
            {replaceDumpstersList.map((type, index) => {
              const data = replaceDumpsters[type];
              return (
                <View
                  key={type}
                  style={[
                    styles.dumpsterItem,
                    index === replaceDumpstersList.length - 1 && styles.dumpsterItemLast,
                  ]}
                >
                  <Text style={styles.dumpsterType}>{type}</Text>
                  <Text style={styles.dumpsterDetail}>Quantity: {data.quantity}</Text>
                  {data.extraWorkQuantity > 0 && (
                    <Text style={styles.dumpsterDetail}>
                      Extra Work: {data.extraWorkQuantity}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>SUBMIT</Text>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
