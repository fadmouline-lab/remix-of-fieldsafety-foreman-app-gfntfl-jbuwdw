
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const equipmentList = [
  'Excavator',
  'Forklift',
  'Concrete Saw',
  'Generator',
  'Scissor Lift',
];

export default function EquipmentInspectionStartScreen() {
  const router = useRouter();
  const [showEquipmentList, setShowEquipmentList] = useState(false);

  const handleScanQRCode = () => {
    console.log('Scan QR Code - Placeholder');
    // Placeholder: Automatically select equipment after scanning
    // For now, just navigate to checklist with a placeholder equipment
    router.push({
      pathname: '/equipment-inspection-2',
      params: {
        equipment: 'Excavator (QR Scanned)',
      },
    });
  };

  const handleSelectEquipment = (equipment: string) => {
    console.log('Selected equipment:', equipment);
    setShowEquipmentList(false);
    router.push({
      pathname: '/equipment-inspection-2',
      params: {
        equipment,
      },
    });
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
        <Text style={styles.headerTitle}>Equipment Inspection – Start</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Select how you would like to identify the equipment:
        </Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleScanQRCode}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="qrcode"
              android_material_icon_name="qr-code-scanner"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.optionButtonText}>Scan QR Code</Text>
          <Text style={styles.optionButtonSubtext}>
            Use your camera to scan the equipment QR code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowEquipmentList(true)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="list.bullet"
              android_material_icon_name="list"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.optionButtonText}>Select Manually</Text>
          <Text style={styles.optionButtonSubtext}>
            Choose equipment from a list
          </Text>
        </TouchableOpacity>
      </View>

      {/* Equipment List Modal */}
      <Modal
        visible={showEquipmentList}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEquipmentList(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEquipmentList(false)}
        >
          <View style={styles.equipmentListContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Equipment</Text>
              <TouchableOpacity onPress={() => setShowEquipmentList(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.equipmentScroll}>
              {equipmentList.map((equipment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.equipmentOption}
                  onPress={() => handleSelectEquipment(equipment)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.equipmentOptionText}>{equipment}</Text>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  optionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  optionButtonSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  equipmentListContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  equipmentScroll: {
    maxHeight: 400,
  },
  equipmentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipmentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
});
