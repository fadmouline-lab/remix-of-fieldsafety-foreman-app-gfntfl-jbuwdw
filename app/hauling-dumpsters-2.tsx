
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
  Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

interface DumpsterData {
  type: string;
  quantity: number;
  isExtraWork: boolean | null;
  extraWorkQuantity: number;
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  dumpsterItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  },
  extraWorkBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  extraWorkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  editButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
  },
  cancelButtonText: {
    color: colors.text,
  },
  confirmButtonText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentProject, currentEmployee } = useAuth();

  const haulingCompany = params.haulingCompany as string;
  const addDumpsters: DumpsterData[] = params.addDumpsters
    ? JSON.parse(params.addDumpsters as string)
    : [];
  const replaceDumpsters: DumpsterData[] = params.replaceDumpsters
    ? JSON.parse(params.replaceDumpsters as string)
    : [];

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(getDefaultAddress());
  const [tempAddress, setTempAddress] = useState(address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getDefaultAddress(): string {
    return currentProject?.location || '123 Construction Site, Chicago, IL 60611';
  }

  function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function getUserName(): string {
    if (currentEmployee?.first_name && currentEmployee?.last_name) {
      return `${currentEmployee.first_name} ${currentEmployee.last_name}`;
    }
    return 'John Doe';
  }

  const handleEditAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(true);
  };

  const handleConfirmAddress = () => {
    setAddress(tempAddress);
    setIsEditingAddress(false);
  };

  const handleCancelAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Placeholder for actual submission logic
      // This would normally call the edge function
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Hauling request submitted successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/(home)'),
        },
      ]);
    } catch (error) {
      console.error('Error submitting hauling request:', error);
      Alert.alert('Error', 'Failed to submit hauling request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDumpsterItem = (dumpster: DumpsterData) => (
    <View key={dumpster.type} style={styles.dumpsterItem}>
      <Text style={styles.dumpsterType}>{dumpster.type}</Text>
      <Text style={styles.dumpsterDetail}>Quantity: {dumpster.quantity}</Text>
      {dumpster.isExtraWork && dumpster.extraWorkQuantity > 0 && (
        <View style={styles.extraWorkBadge}>
          <Text style={styles.extraWorkText}>
            Extra Work: {dumpster.extraWorkQuantity}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.subtitle}>
          Please review your hauling request before submitting
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hauling Company</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{haulingCompany}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Dumpsters</Text>
          {addDumpsters.length > 0 ? (
            addDumpsters.map(renderDumpsterItem)
          ) : (
            <Text style={styles.emptyText}>No dumpsters to add</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Replace Dumpsters</Text>
          {replaceDumpsters.length > 0 ? (
            replaceDumpsters.map(renderDumpsterItem)
          ) : (
            <Text style={styles.emptyText}>No dumpsters to replace</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted by:</Text>
              <Text style={styles.infoValue}>{getUserName()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{getCurrentTime()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionTitle}>Address</Text>
              {!isEditingAddress && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditAddress}
                >
                  <IconSymbol name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            {isEditingAddress ? (
              <>
                <TextInput
                  style={styles.input}
                  value={tempAddress}
                  onChangeText={setTempAddress}
                  multiline
                  numberOfLines={3}
                  placeholder="Enter delivery address"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelAddress}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmAddress}
                  >
                    <Text style={[styles.buttonText, styles.confirmButtonText]}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.addressText}>{address}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
