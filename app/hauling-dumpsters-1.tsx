
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';

type DumpsterType = '10 Yard' | '20 Yard' | '30 Yard' | '40 Yard';

interface DumpsterData {
  quantity: number;
  extraWork: boolean;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<DumpsterType, DumpsterData>;

const DUMPSTER_TYPES: DumpsterType[] = ['10 Yard', '20 Yard', '30 Yard', '40 Yard'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: { marginRight: 12 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  dumpsterCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dumpsterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dumpsterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: colors.border,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  extraWorkSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extraWorkQuestion: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  extraWorkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  extraWorkButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  extraWorkButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  extraWorkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  extraWorkButtonTextSelected: {
    color: '#fff',
  },
  extraWorkQuantityControl: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraWorkLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [addQuantities, setAddQuantities] = useState<DumpsterQuantities>({
    '10 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '20 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '30 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '40 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
  });

  const [replaceQuantities, setReplaceQuantities] = useState<DumpsterQuantities>({
    '10 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '20 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '30 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
    '40 Yard': { quantity: 0, extraWork: false, extraWorkQuantity: 0 },
  });

  const updateQuantity = (
    type: DumpsterType,
    section: 'add' | 'replace',
    delta: number
  ) => {
    const setter = section === 'add' ? setAddQuantities : setReplaceQuantities;
    setter(prev => {
      const current = prev[type];
      const newQuantity = Math.max(0, current.quantity + delta);
      return {
        ...prev,
        [type]: {
          ...current,
          quantity: newQuantity,
          extraWork: newQuantity > 0 ? current.extraWork : false,
          extraWorkQuantity: newQuantity > 0 ? Math.min(current.extraWorkQuantity, newQuantity) : 0,
        },
      };
    });
  };

  const setExtraWork = (
    type: DumpsterType,
    section: 'add' | 'replace',
    value: boolean
  ) => {
    const setter = section === 'add' ? setAddQuantities : setReplaceQuantities;
    setter(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraWork: value,
        extraWorkQuantity: value ? 1 : 0,
      },
    }));
  };

  const updateExtraWorkQuantity = (
    type: DumpsterType,
    section: 'add' | 'replace',
    delta: number
  ) => {
    const setter = section === 'add' ? setAddQuantities : setReplaceQuantities;
    setter(prev => {
      const current = prev[type];
      const newQuantity = Math.max(1, Math.min(current.quantity, current.extraWorkQuantity + delta));
      return {
        ...prev,
        [type]: { ...current, extraWorkQuantity: newQuantity },
      };
    });
  };

  const renderDumpsterCard = (
    type: DumpsterType,
    section: 'add' | 'replace'
  ) => {
    const quantities = section === 'add' ? addQuantities : replaceQuantities;
    const data = quantities[type];

    return (
      <View key={`${section}-${type}`} style={styles.dumpsterCard}>
        <View style={styles.dumpsterHeader}>
          <Text style={styles.dumpsterLabel}>{type}</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                data.quantity === 0 && styles.quantityButtonDisabled,
              ]}
              onPress={() => updateQuantity(type, section, -1)}
              disabled={data.quantity === 0}
            >
              <IconSymbol ios_icon_name="minus" android_material_icon_name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{data.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(type, section, 1)}
            >
              <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {data.quantity > 0 && (
          <View style={styles.extraWorkSection}>
            <Text style={styles.extraWorkQuestion}>
              Are any of these dumpsters for extra work?
            </Text>
            <View style={styles.extraWorkButtons}>
              <TouchableOpacity
                style={[
                  styles.extraWorkButton,
                  data.extraWork && styles.extraWorkButtonSelected,
                ]}
                onPress={() => setExtraWork(type, section, true)}
              >
                <Text
                  style={[
                    styles.extraWorkButtonText,
                    data.extraWork && styles.extraWorkButtonTextSelected,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.extraWorkButton,
                  !data.extraWork && styles.extraWorkButtonSelected,
                ]}
                onPress={() => setExtraWork(type, section, false)}
              >
                <Text
                  style={[
                    styles.extraWorkButtonText,
                    !data.extraWork && styles.extraWorkButtonTextSelected,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>

            {data.extraWork && (
              <View style={styles.extraWorkQuantityControl}>
                <Text style={styles.extraWorkLabel}>Extra work quantity:</Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      data.extraWorkQuantity === 1 && styles.quantityButtonDisabled,
                    ]}
                    onPress={() => updateExtraWorkQuantity(type, section, -1)}
                    disabled={data.extraWorkQuantity === 1}
                  >
                    <IconSymbol ios_icon_name="minus" android_material_icon_name="remove" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{data.extraWorkQuantity}</Text>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      data.extraWorkQuantity === data.quantity && styles.quantityButtonDisabled,
                    ]}
                    onPress={() => updateExtraWorkQuantity(type, section, 1)}
                    disabled={data.extraWorkQuantity === data.quantity}
                  >
                    <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleNext = () => {
    const hasSelection = DUMPSTER_TYPES.some(
      type => addQuantities[type].quantity > 0 || replaceQuantities[type].quantity > 0
    );

    if (!hasSelection) {
      Alert.alert('Required', 'Please select at least one dumpster');
      return;
    }

    router.push({
      pathname: '/hauling-dumpsters-2',
      params: {
        ...params,
        addQuantities: JSON.stringify(addQuantities),
        replaceQuantities: JSON.stringify(replaceQuantities),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
        </View>

        <Text style={styles.sectionTitle}>Add Dumpsters</Text>
        {DUMPSTER_TYPES.map(type => renderDumpsterCard(type, 'add'))}

        <Text style={styles.sectionTitle}>Replace Dumpsters</Text>
        {DUMPSTER_TYPES.map(type => renderDumpsterCard(type, 'replace'))}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
