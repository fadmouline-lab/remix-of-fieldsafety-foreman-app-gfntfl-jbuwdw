
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

interface DumpsterData {
  quantity: number;
  extraWorkAnswer: 'yes' | 'no' | null;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<string, DumpsterData>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dumpsterItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dumpsterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dumpsterDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addressSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.text,
  },
  confirmButtonText: {
    color: colors.white,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();

  const haulingCompany = params.haulingCompany as string;
  const mode = params.mode as 'add' | 'replace';
  const dumpsters: DumpsterQuantities = JSON.parse(params.dumpsters as string);

  const [address, setAddress] = useState(getDefaultAddress());
  const [editingAddress, setEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  function getDefaultAddress(): string {
    if (currentProject?.address) {
      return currentProject.address;
    }
    return 'Project Address';
  }

  function getUserName(): string {
    if (currentEmployee?.first_name && currentEmployee?.last_name) {
      return `${currentEmployee.first_name} ${currentEmployee.last_name}`;
    }
    return 'User Name';
  }

  function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const handleEditAddress = () => {
    setTempAddress(address);
    setEditingAddress(true);
  };

  const handleConfirmAddress = () => {
    setAddress(tempAddress);
    setEditingAddress(false);
  };

  const handleCancelAddress = () => {
    setTempAddress(address);
    setEditingAddress(false);
  };

  const handleSubmit = () => {
    Alert.alert('Success', 'Hauling dumpster request submitted!', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/(home)'),
      },
    ]);
  };

  const activeDumpsters = Object.entries(dumpsters).filter(([_, data]) => data.quantity > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Summary</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Request Details</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hauling Company</Text>
            <Text style={styles.summaryValue}>{haulingCompany}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Request Type</Text>
            <Text style={styles.summaryValue}>
              {mode === 'add' ? 'Add Dumpsters' : 'Replace Dumpsters'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Submitted By</Text>
            <Text style={styles.summaryValue}>{getUserName()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Submission Time</Text>
            <Text style={styles.summaryValue}>{getCurrentTime()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dumpsters</Text>

        <View style={styles.summaryCard}>
          {activeDumpsters.map(([type, data], index) => (
            <View
              key={type}
              style={[
                styles.dumpsterItem,
                index === activeDumpsters.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.dumpsterName}>{type}</Text>
              <Text style={styles.dumpsterDetail}>Total quantity: {data.quantity}</Text>
              {data.extraWorkAnswer === 'yes' && (
                <Text style={styles.dumpsterDetail}>
                  Extra work quantity: {data.extraWorkQuantity}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Location</Text>

        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>Address</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditAddress}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={editingAddress}
        transparent
        animationType="fade"
        onRequestClose={handleCancelAddress}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Address</Text>
            <TextInput
              style={styles.input}
              value={tempAddress}
              onChangeText={setTempAddress}
              placeholder="Enter address"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelAddress}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmAddress}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
