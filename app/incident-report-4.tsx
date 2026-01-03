
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const PLACEHOLDER_EQUIPMENT = ['Excavator', 'Skid Steer', 'Truck', 'Generator'];
const PLACEHOLDER_MATERIALS = ['Concrete', 'Rebar', 'Wood', 'Asphalt'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  dropdownButton: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default function IncidentReportPage4() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [equipmentInvolved, setEquipmentInvolved] = useState<'yes' | 'no' | null>(
    params.equipmentInvolved ? (params.equipmentInvolved as 'yes' | 'no') : null
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    params.selectedEquipment ? JSON.parse(params.selectedEquipment as string) : []
  );
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const [materialsInvolved, setMaterialsInvolved] = useState<'yes' | 'no' | null>(
    params.materialsInvolved ? (params.materialsInvolved as 'yes' | 'no') : null
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    params.selectedMaterials ? JSON.parse(params.selectedMaterials as string) : []
  );
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);

  const [bodyPartDescription, setBodyPartDescription] = useState(
    params.bodyPartDescription as string || ''
  );

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

  const handleBack = () => {
    router.push({
      pathname: '/incident-report-3',
      params: {
        need911: params.need911 as string,
        called911: params.called911 as string,
        photos: params.photos as string,
        selectedEmployees: params.selectedEmployees as string,
        subcontractorInjured: params.subcontractorInjured as string,
        subcontractors: params.subcontractors as string,
        otherInjured: params.otherInjured as string,
        incidentTime: params.incidentTime as string,
        specificArea: params.specificArea as string,
        selectedTasks: params.selectedTasks as string,
        firstAidProvided: params.firstAidProvided as string,
        anyWitnesses: params.anyWitnesses as string,
        witnesses: params.witnesses as string,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow-back" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipment, Materials & Injury Area</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Was any equipment involved?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  equipmentInvolved === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => setEquipmentInvolved('yes')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    equipmentInvolved === 'yes' && styles.toggleButtonTextActive,
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
                    styles.toggleButtonText,
                    equipmentInvolved === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {equipmentInvolved === 'yes' && (
            <>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowEquipmentModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedEquipment.length > 0
                    ? `${selectedEquipment.length} selected`
                    : 'Select equipment'}
                </Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="arrow-drop-down" 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>

              {selectedEquipment.length > 0 && (
                <View style={styles.selectedItems}>
                  {selectedEquipment.map((equip) => (
                    <View key={equip} style={styles.chip}>
                      <Text style={styles.chipText}>{equip}</Text>
                      <TouchableOpacity onPress={() => toggleEquipment(equip)}>
                        <IconSymbol 
                          ios_icon_name="xmark" 
                          android_material_icon_name="close" 
                          size={14} 
                          color="#FFFFFF" 
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Were any materials involved?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  materialsInvolved === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => setMaterialsInvolved('yes')}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    materialsInvolved === 'yes' && styles.toggleButtonTextActive,
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
                    styles.toggleButtonText,
                    materialsInvolved === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {materialsInvolved === 'yes' && (
            <>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMaterialsModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedMaterials.length > 0
                    ? `${selectedMaterials.length} selected`
                    : 'Select materials'}
                </Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="arrow-drop-down" 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>

              {selectedMaterials.length > 0 && (
                <View style={styles.selectedItems}>
                  {selectedMaterials.map((mat) => (
                    <View key={mat} style={styles.chip}>
                      <Text style={styles.chipText}>{mat}</Text>
                      <TouchableOpacity onPress={() => toggleMaterial(mat)}>
                        <IconSymbol 
                          ios_icon_name="xmark" 
                          android_material_icon_name="close" 
                          size={14} 
                          color="#FFFFFF" 
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Body part affected</Text>
          <Text style={[styles.label, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>
            Describe body part affected
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter description..."
            value={bodyPartDescription}
            onChangeText={setBodyPartDescription}
            multiline
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <Modal visible={showEquipmentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Equipment</Text>
            <ScrollView>
              {PLACEHOLDER_EQUIPMENT.map((equip) => (
                <TouchableOpacity
                  key={equip}
                  style={styles.modalOption}
                  onPress={() => toggleEquipment(equip)}
                >
                  <Text style={styles.modalOptionText}>
                    {selectedEquipment.includes(equip) ? '✓ ' : ''}
                    {equip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEquipmentModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMaterialsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Materials</Text>
            <ScrollView>
              {PLACEHOLDER_MATERIALS.map((mat) => (
                <TouchableOpacity
                  key={mat}
                  style={styles.modalOption}
                  onPress={() => toggleMaterial(mat)}
                >
                  <Text style={styles.modalOptionText}>
                    {selectedMaterials.includes(mat) ? '✓ ' : ''}
                    {mat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMaterialsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
