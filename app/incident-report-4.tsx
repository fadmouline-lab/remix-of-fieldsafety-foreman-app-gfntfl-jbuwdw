
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SearchableDropdown from '@/components/SearchableDropdown';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface EquipmentItem {
  id: string;
  name: string;
}

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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default function IncidentReportPage4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee } = useAuth();

  // Equipment state
  const [equipmentInvolved, setEquipmentInvolved] = useState<'yes' | 'no' | null>(
    params.equipmentInvolved ? (params.equipmentInvolved as 'yes' | 'no') : null
  );
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    params.selectedEquipment ? JSON.parse(params.selectedEquipment as string) : []
  );
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  // Materials state
  const [materialsInvolved, setMaterialsInvolved] = useState<'yes' | 'no' | null>(
    params.materialsInvolved ? (params.materialsInvolved as 'yes' | 'no') : null
  );
  const [materials, setMaterials] = useState<EquipmentItem[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    params.selectedMaterials ? JSON.parse(params.selectedMaterials as string) : []
  );
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);

  // Body part description
  const [bodyPartDescription, setBodyPartDescription] = useState(
    params.bodyPartDescription as string || ''
  );

  // Fetch equipment when user selects "Yes" for equipment involved
  useEffect(() => {
    const fetchEquipment = async () => {
      if (equipmentInvolved !== 'yes' || !currentEmployee?.org_id) {
        return;
      }

      setLoadingEquipment(true);
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name')
          .eq('org_id', currentEmployee.org_id)
          .eq('kind', 'equipment')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching equipment:', error);
        } else {
          const formattedEquipment = (data || []).map((item) => ({
            id: item.id,
            name: item.name,
          }));
          setEquipment(formattedEquipment);
        }
      } catch (error) {
        console.error('Exception fetching equipment:', error);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, [equipmentInvolved, currentEmployee?.org_id]);

  // Fetch materials when user selects "Yes" for materials involved
  useEffect(() => {
    const fetchMaterials = async () => {
      if (materialsInvolved !== 'yes' || !currentEmployee?.org_id) {
        return;
      }

      setLoadingMaterials(true);
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name')
          .eq('org_id', currentEmployee.org_id)
          .eq('kind', 'material')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching materials:', error);
        } else {
          const formattedMaterials = (data || []).map((item) => ({
            id: item.id,
            name: item.name,
          }));
          setMaterials(formattedMaterials);
        }
      } catch (error) {
        console.error('Exception fetching materials:', error);
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [materialsInvolved, currentEmployee?.org_id]);

  const toggleEquipment = (equipmentId: string) => {
    if (selectedEquipment.includes(equipmentId)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== equipmentId));
    } else {
      setSelectedEquipment([...selectedEquipment, equipmentId]);
    }
  };

  const toggleMaterial = (materialId: string) => {
    if (selectedMaterials.includes(materialId)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== materialId));
    } else {
      setSelectedMaterials([...selectedMaterials, materialId]);
    }
  };

  const getEquipmentName = (equipmentId: string) => {
    const item = equipment.find((e) => e.id === equipmentId);
    return item?.name || equipmentId;
  };

  const getMaterialName = (materialId: string) => {
    const item = materials.find((m) => m.id === materialId);
    return item?.name || materialId;
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
              {loadingEquipment ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 8 }}>
                    Loading equipment...
                  </Text>
                </View>
              ) : (
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
                      {selectedEquipment.map((equipId) => (
                        <View key={equipId} style={styles.chip}>
                          <Text style={styles.chipText}>{getEquipmentName(equipId)}</Text>
                          <TouchableOpacity onPress={() => toggleEquipment(equipId)}>
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
              {loadingMaterials ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 8 }}>
                    Loading materials...
                  </Text>
                </View>
              ) : (
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
                      {selectedMaterials.map((matId) => (
                        <View key={matId} style={styles.chip}>
                          <Text style={styles.chipText}>{getMaterialName(matId)}</Text>
                          <TouchableOpacity onPress={() => toggleMaterial(matId)}>
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
            placeholderTextColor={colors.text + '80'}
            value={bodyPartDescription}
            onChangeText={setBodyPartDescription}
            multiline
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <SearchableDropdown
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        title="Select Equipment"
        items={equipment}
        selectedIds={selectedEquipment}
        onToggleItem={toggleEquipment}
        multiSelect={true}
        loading={loadingEquipment}
        initialLimit={20}
      />

      <SearchableDropdown
        visible={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        title="Select Materials"
        items={materials}
        selectedIds={selectedMaterials}
        onToggleItem={toggleMaterial}
        multiSelect={true}
        loading={loadingMaterials}
        initialLimit={20}
      />
    </View>
  );
}
