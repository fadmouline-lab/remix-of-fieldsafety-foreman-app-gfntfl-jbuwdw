
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const PLACEHOLDER_EQUIPMENT = ['Excavator', 'Skid Steer', 'Truck', 'Generator'];
const PLACEHOLDER_MATERIALS = ['Concrete', 'Rebar', 'Wood', 'Asphalt'];

const IncidentReportPage4: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [equipmentInvolved, setEquipmentInvolved] = useState<'yes' | 'no' | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  
  const [materialsInvolved, setMaterialsInvolved] = useState<'yes' | 'no' | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showMaterialsDropdown, setShowMaterialsDropdown] = useState(false);
  
  const [bodyPartDescription, setBodyPartDescription] = useState('');

  const toggleEquipment = (equipment: string) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== equipment));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  const toggleMaterial = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-5',
      params: {
        ...params,
        equipmentInvolved: equipmentInvolved || '',
        selectedEquipment: JSON.stringify(selectedEquipment),
        materialsInvolved: materialsInvolved || '',
        selectedMaterials: JSON.stringify(selectedMaterials),
        bodyPartDescription,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipment, Materials & Injury Area</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Equipment */}
        <Text style={styles.label}>Was any equipment involved?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              equipmentInvolved === 'yes' && styles.toggleButtonActive,
            ]}
            onPress={() => setEquipmentInvolved('yes')}
          >
            <Text
              style={[
                styles.toggleText,
                equipmentInvolved === 'yes' && styles.toggleTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              equipmentInvolved === 'no' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setEquipmentInvolved('no');
              setSelectedEquipment([]);
            }}
          >
            <Text
              style={[
                styles.toggleText,
                equipmentInvolved === 'no' && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {equipmentInvolved === 'yes' && (
          <>
            <TouchableOpacity
              style={[styles.dropdownButton, styles.marginTopSmall]}
              onPress={() => setShowEquipmentDropdown(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedEquipment.length > 0
                  ? `${selectedEquipment.length} selected`
                  : 'Select equipment'}
              </Text>
              <IconSymbol name="chevron.down" size={20} color={colors.text} />
            </TouchableOpacity>

            {selectedEquipment.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedEquipment.map((equipment) => (
                  <View key={equipment} style={styles.chip}>
                    <Text style={styles.chipText}>{equipment}</Text>
                    <TouchableOpacity onPress={() => toggleEquipment(equipment)}>
                      <IconSymbol name="xmark" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Materials */}
        <Text style={[styles.label, styles.marginTop]}>Were any materials involved?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              materialsInvolved === 'yes' && styles.toggleButtonActive,
            ]}
            onPress={() => setMaterialsInvolved('yes')}
          >
            <Text
              style={[
                styles.toggleText,
                materialsInvolved === 'yes' && styles.toggleTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              materialsInvolved === 'no' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setMaterialsInvolved('no');
              setSelectedMaterials([]);
            }}
          >
            <Text
              style={[
                styles.toggleText,
                materialsInvolved === 'no' && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {materialsInvolved === 'yes' && (
          <>
            <TouchableOpacity
              style={[styles.dropdownButton, styles.marginTopSmall]}
              onPress={() => setShowMaterialsDropdown(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedMaterials.length > 0
                  ? `${selectedMaterials.length} selected`
                  : 'Select materials'}
              </Text>
              <IconSymbol name="chevron.down" size={20} color={colors.text} />
            </TouchableOpacity>

            {selectedMaterials.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedMaterials.map((material) => (
                  <View key={material} style={styles.chip}>
                    <Text style={styles.chipText}>{material}</Text>
                    <TouchableOpacity onPress={() => toggleMaterial(material)}>
                      <IconSymbol name="xmark" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Body Part Affected */}
        <Text style={[styles.label, styles.marginTop]}>Body part affected</Text>
        <Text style={styles.inputLabel}>Describe body part affected</Text>
        <TextInput
          style={styles.textArea}
          value={bodyPartDescription}
          onChangeText={setBodyPartDescription}
          placeholder="Enter description"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Equipment Dropdown Modal */}
      <Modal visible={showEquipmentDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEquipmentDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Equipment</Text>
            {PLACEHOLDER_EQUIPMENT.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={styles.modalItem}
                onPress={() => toggleEquipment(equipment)}
              >
                <Text style={styles.modalItemText}>{equipment}</Text>
                {selectedEquipment.includes(equipment) && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEquipmentDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Materials Dropdown Modal */}
      <Modal visible={showMaterialsDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaterialsDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Materials</Text>
            {PLACEHOLDER_MATERIALS.map((material) => (
              <TouchableOpacity
                key={material}
                style={styles.modalItem}
                onPress={() => toggleMaterial(material)}
              >
                <Text style={styles.modalItemText}>{material}</Text>
                {selectedMaterials.includes(material) && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMaterialsDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 24,
  },
  marginTopSmall: {
    marginTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  toggleTextActive: {
    color: '#fff',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 14,
    color: colors.primary,
  },
  textArea: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default IncidentReportPage4;
