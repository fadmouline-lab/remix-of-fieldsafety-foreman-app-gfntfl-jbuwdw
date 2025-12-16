
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface DumpsterQuantities {
  [key: string]: number;
}

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const addQuantities: DumpsterQuantities = params.addQuantities
    ? JSON.parse(params.addQuantities as string)
    : {};
    
  const replaceQuantities: DumpsterQuantities = params.replaceQuantities
    ? JSON.parse(params.replaceQuantities as string)
    : {};

  const addItems = Object.entries(addQuantities).filter(([_, qty]) => qty > 0);
  const replaceItems = Object.entries(replaceQuantities).filter(([_, qty]) => qty > 0);

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // State for additional fields
  const [currentTime] = useState(getCurrentTime());
  const [userName] = useState('Juan Perez'); // Placeholder for logged-in foreman
  const [address, setAddress] = useState('123 Construction Site Ave, Chicago, IL 60611');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  const handleEditAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(true);
  };

  const handleConfirmAddress = () => {
    setAddress(tempAddress);
    setIsEditingAddress(false);
    console.log('Address updated to:', tempAddress);
  };

  const handleCancelAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(false);
  };

  const handleSubmit = () => {
    console.log('Submitting Hauling Dumpsters Request...');
    console.log('Add quantities:', addQuantities);
    console.log('Replace quantities:', replaceQuantities);
    console.log('Time:', currentTime);
    console.log('User Name:', userName);
    console.log('Address:', address);
    
    // Navigate back to Dashboard
    router.back();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hauling Dumpsters – Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Confirm you are requesting the following boxes:
        </Text>

        {/* To be added section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>To be added</Text>
          
          {addItems.length > 0 ? (
            <View style={styles.itemsContainer}>
              {addItems.map(([type, quantity], index) => (
                <View
                  key={index}
                  style={[
                    styles.summaryRow,
                    index === addItems.length - 1 && styles.summaryRowLast,
                  ]}
                >
                  <Text style={styles.itemType}>{type}</Text>
                  <Text style={styles.itemQuantity}>
                    {quantity} {quantity === 1 ? 'box' : 'boxes'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noneSelected}>None selected</Text>
          )}
        </View>

        {/* To be replaced section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>To be replaced</Text>
          
          {replaceItems.length > 0 ? (
            <View style={styles.itemsContainer}>
              {replaceItems.map(([type, quantity], index) => (
                <View
                  key={index}
                  style={[
                    styles.summaryRow,
                    index === replaceItems.length - 1 && styles.summaryRowLast,
                  ]}
                >
                  <Text style={styles.itemType}>{type}</Text>
                  <Text style={styles.itemQuantity}>
                    {quantity} {quantity === 1 ? 'box' : 'boxes'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noneSelected}>None selected</Text>
          )}
        </View>

        {/* Additional Information Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          
          {/* User Name */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User Name</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>

          {/* Time */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{currentTime}</Text>
          </View>

          {/* Address with Edit */}
          {!isEditingAddress ? (
            <View style={styles.infoRow}>
              <View style={styles.addressContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{address}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditAddress}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editRow}>
              <View style={styles.editInputContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempAddress}
                  onChangeText={setTempAddress}
                  placeholder="Enter address"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  autoFocus
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleConfirmAddress}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={28}
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCancelAddress}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  instruction: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  itemType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noneSelected: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    padding: 8,
  },
  editRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editInputContainer: {
    marginBottom: 12,
  },
  editInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
