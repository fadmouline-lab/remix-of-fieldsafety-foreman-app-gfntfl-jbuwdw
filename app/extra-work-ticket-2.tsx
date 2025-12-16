
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface EquipmentQuantities {
  [key: string]: number;
}

interface MaterialQuantities {
  [key: string]: number;
}

const equipmentTypes = ['Excavator', 'Forklift', 'Jackhammer', 'Generator'];
const materialTypes = ['Saw Blades', 'Gloves', 'Plastic', 'Plywood'];

export default function ExtraWorkTicketEquipmentMaterialsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workers = params.workers ? JSON.parse(params.workers as string) : [];

  const [equipmentUsed, setEquipmentUsed] = useState(false);
  const [materialsUsed, setMaterialsUsed] = useState(false);

  const [equipmentQuantities, setEquipmentQuantities] = useState<EquipmentQuantities>(
    equipmentTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );

  const [materialQuantities, setMaterialQuantities] = useState<MaterialQuantities>(
    materialTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );

  const handleQuantityChange = (
    section: 'equipment' | 'materials',
    type: string,
    delta: number
  ) => {
    if (section === 'equipment') {
      setEquipmentQuantities((prev) => ({
        ...prev,
        [type]: Math.max(0, Math.min(20, prev[type] + delta)),
      }));
    } else {
      setMaterialQuantities((prev) => ({
        ...prev,
        [type]: Math.max(0, Math.min(20, prev[type] + delta)),
      }));
    }
  };

  const handleNext = () => {
    console.log('Navigating to Extra Work Ticket - Subs & Hauling');
    router.push({
      pathname: '/extra-work-ticket-3',
      params: {
        workers: JSON.stringify(workers),
        equipmentQuantities: JSON.stringify(equipmentQuantities),
        materialQuantities: JSON.stringify(materialQuantities),
      },
    });
  };

  const renderQuantityControl = (
    section: 'equipment' | 'materials',
    type: string,
    quantity: number
  ) => (
    <View key={type} style={styles.quantityRow}>
      <Text style={styles.itemType}>{type}</Text>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(section, type, -1)}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="minus.circle.fill"
            android_material_icon_name="remove-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.quantityValue}>{quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(section, type, 1)}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Extra Work Ticket – Equipment & Materials</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Equipment Section */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.questionText}>
              Did you use any equipment for extra work?
            </Text>
            <Switch
              value={equipmentUsed}
              onValueChange={setEquipmentUsed}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {equipmentUsed && (
            <View style={styles.itemsContainer}>
              {equipmentTypes.map((type) =>
                renderQuantityControl('equipment', type, equipmentQuantities[type])
              )}
            </View>
          )}
        </View>

        {/* Materials Section */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.questionText}>
              Did you use any materials for extra work?
            </Text>
            <Switch
              value={materialsUsed}
              onValueChange={setMaterialsUsed}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {materialsUsed && (
            <View style={styles.itemsContainer}>
              {materialTypes.map((type) =>
                renderQuantityControl('materials', type, materialQuantities[type])
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
  section: {
    marginBottom: 32,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  itemsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
