
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
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dateTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  addressInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dumpsterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dumpsterType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dumpsterQuantity: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  extraWorkText: {
    fontSize: 15,
    color: colors.primary,
    marginTop: 4,
  },
  footer: {
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
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage2Screen() {
  const { currentProject, currentEmployee } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projectAddress, setProjectAddress] = useState('');
  
  const params = useLocalSearchParams();
  
  useEffect(() => {
    if (currentProject?.address) {
      setProjectAddress(currentProject.address);
    }
  }, [currentProject]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSubmit = async () => {
    // Guard: prevent double submissions
    if (loading) {
      console.log('Submit already in progress, ignoring duplicate request');
      return;
    }
    
    setLoading(true);
    console.log('Starting hauling request submission...');
    
    try {
      const haulingCompanyId = params.haulingCompanyId as string;
      const haulingCompanyName = params.haulingCompanyName as string;
      const haulingCompanyPhone = params.haulingCompanyPhone as string;
      const haulingCompanyEmail = params.haulingCompanyEmail as string;
      
      const addDumpstersRaw = params.addDumpsters as string;
      const replaceDumpstersRaw = params.replaceDumpsters as string;
      
      const addDumpsters: DumpsterQuantities = addDumpstersRaw 
        ? JSON.parse(addDumpstersRaw) 
        : {};
      const replaceDumpsters: DumpsterQuantities = replaceDumpstersRaw 
        ? JSON.parse(replaceDumpstersRaw) 
        : {};

      const payload = {
        project_id: currentProject?.id,
        project_address: projectAddress,
        hauling_company_id: haulingCompanyId,
        hauling_company_name: haulingCompanyName,
        hauling_company_phone: haulingCompanyPhone,
        hauling_company_email: haulingCompanyEmail,
        add_dumpsters: addDumpsters,
        replace_dumpsters: replaceDumpsters,
      };

      console.log('Invoking submit-hauling-request Edge Function with payload:', payload);

      const { data: response, error: edgeFunctionError } = await supabase.functions.invoke(
        'submit-hauling-request',
        { body: payload }
      );

      console.log('Edge Function response:', response);
      console.log('Edge Function error:', edgeFunctionError);

      if (edgeFunctionError) {
        console.error('Edge Function returned error:', edgeFunctionError);
        Alert.alert(
          'Submission Error',
          `Failed to submit hauling request: ${edgeFunctionError.message}`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (response?.success) {
        console.log('Hauling request submitted successfully');
        Alert.alert(
          'Success',
          'Hauling request submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating back to dashboard');
                router.replace('/(tabs)/(home)');
              },
            },
          ]
        );
      } else {
        console.warn('Hauling request submission unclear:', response);
        Alert.alert(
          'Warning',
          response?.message || 'Request submitted but status unclear.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating back to dashboard after warning');
                router.replace('/(tabs)/(home)');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Exception during hauling request submission:', error);
      Alert.alert(
        'Error',
        `An unexpected error occurred: ${error?.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      // Always reset loading state, no matter what happened
      console.log('Resetting loading state');
      setLoading(false);
    }
  };

  const renderDumpsterList = (dumpsters: DumpsterQuantities, title: string) => {
    const entries = Object.entries(dumpsters).filter(
      ([_, data]) => data.quantity > 0
    );

    if (entries.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {entries.map(([type, data], index) => (
          <View 
            key={type} 
            style={[
              styles.dumpsterItem,
              index === entries.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <Text style={styles.dumpsterType}>{type}</Text>
            <Text style={styles.dumpsterQuantity}>
              Quantity: {data.quantity}
            </Text>
            {data.extraWorkAnswer === 'yes' && data.extraWorkQuantity > 0 && (
              <Text style={styles.extraWorkText}>
                Extra Work: {data.extraWorkQuantity}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow-back"
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateTime}>
          {getCurrentDate()} • {getCurrentTime()}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Address</Text>
          <TextInput
            style={styles.addressInput}
            value={projectAddress}
            onChangeText={setProjectAddress}
            placeholder="Enter project address"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {renderDumpsterList(
          params.addDumpsters ? JSON.parse(params.addDumpsters as string) : {},
          'Add Dumpsters'
        )}

        {renderDumpsterList(
          params.replaceDumpsters ? JSON.parse(params.replaceDumpsters as string) : {},
          'Replace Dumpsters'
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
