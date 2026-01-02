
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';

type DumpsterType = 'Rubbish' | 'Lead' | 'Concrete' | 'Dirt';

interface DumpsterData {
  quantity: number;
  extraWorkAnswer: 'yes' | 'no' | null;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<DumpsterType, DumpsterData>;

const DUMPSTER_TYPES: DumpsterType[] = ['Rubbish', 'Lead', 'Concrete', 'Dirt'];

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  dumpsterCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dumpsterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dumpsterName: {
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
    backgroundColor: colors.disabled,
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
    marginBottom: 12,
  },
  extraWorkButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  extraWorkButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  extraWorkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  extraWorkButtonTextActive: {
    color: colors.white,
  },
  extraWorkQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraWorkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const haulingCompany = params.haulingCompany as string;

  const [mode, setMode] = useState<'add' | 'replace'>('add');
  const [dumpsters, setDumpsters] = useState<DumpsterQuantities>({
    Rubbish: { quantity: 0, extraWorkAnswer: null, extraWorkQuantity: 1 },
    Lead: { quantity: 0, extraWorkAnswer: null, extraWorkQuantity: 1 },
    Concrete: { quantity: 0, extraWorkAnswer: null, extraWorkQuantity: 1 },
    Dirt: { quantity: 0, extraWorkAnswer: null, extraWorkQuantity: 1 },
  });

  const handleQuantityChange = (type: DumpsterType, delta: number) => {
    setDumpsters((prev) => {
      const newQuantity = Math.max(0, prev[type].quantity + delta);
      const newData = { ...prev[type], quantity: newQuantity };
      
      // Reset extra work data if quantity becomes 0
      if (newQuantity === 0) {
        newData.extraWorkAnswer = null;
        newData.extraWorkQuantity = 1;
      }
      
      // Cap extra work quantity if total quantity decreased
      if (newData.extraWorkAnswer === 'yes' && newData.extraWorkQuantity > newQuantity) {
        newData.extraWorkQuantity = Math.max(1, newQuantity);
      }
      
      return { ...prev, [type]: newData };
    });
  };

  const handleExtraWorkAnswer = (type: DumpsterType, answer: 'yes' | 'no') => {
    setDumpsters((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraWorkAnswer: answer,
        extraWorkQuantity: answer === 'yes' ? 1 : 1,
      },
    }));
  };

  const handleExtraWorkQuantityChange = (type: DumpsterType, delta: number) => {
    setDumpsters((prev) => {
      const maxQuantity = prev[type].quantity;
      const newExtraQuantity = Math.max(1, Math.min(maxQuantity, prev[type].extraWorkQuantity + delta));
      
      return {
        ...prev,
        [type]: { ...prev[type], extraWorkQuantity: newExtraQuantity },
      };
    });
  };

  const hasAnyDumpsters = Object.values(dumpsters).some((d) => d.quantity > 0);

  const handleNext = () => {
    if (!hasAnyDumpsters) return;

    router.push({
      pathname: '/hauling-dumpsters-2',
      params: {
        haulingCompany,
        mode,
        dumpsters: JSON.stringify(dumpsters),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'add' && styles.activeTab]}
            onPress={() => setMode('add')}
          >
            <Text style={[styles.tabText, mode === 'add' && styles.activeTabText]}>
              Add Dumpsters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'replace' && styles.activeTab]}
            onPress={() => setMode('replace')}
          >
            <Text style={[styles.tabText, mode === 'replace' && styles.activeTabText]}>
              Replace Dumpsters
            </Text>
          </TouchableOpacity>
        </View>

        {DUMPSTER_TYPES.map((type) => (
          <View key={type} style={styles.dumpsterCard}>
            <View style={styles.dumpsterHeader}>
              <Text style={styles.dumpsterName}>{type}</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    dumpsters[type].quantity === 0 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(type, -1)}
                  disabled={dumpsters[type].quantity === 0}
                >
                  <IconSymbol
                    ios_icon_name="minus"
                    android_material_icon_name="remove"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{dumpsters[type].quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(type, 1)}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {dumpsters[type].quantity > 0 && (
              <View style={styles.extraWorkSection}>
                <Text style={styles.extraWorkQuestion}>
                  Are any of these dumpsters for extra work?
                </Text>
                <View style={styles.extraWorkButtons}>
                  <TouchableOpacity
                    style={[
                      styles.extraWorkButton,
                      dumpsters[type].extraWorkAnswer === 'yes' && styles.extraWorkButtonActive,
                    ]}
                    onPress={() => handleExtraWorkAnswer(type, 'yes')}
                  >
                    <Text
                      style={[
                        styles.extraWorkButtonText,
                        dumpsters[type].extraWorkAnswer === 'yes' && styles.extraWorkButtonTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.extraWorkButton,
                      dumpsters[type].extraWorkAnswer === 'no' && styles.extraWorkButtonActive,
                    ]}
                    onPress={() => handleExtraWorkAnswer(type, 'no')}
                  >
                    <Text
                      style={[
                        styles.extraWorkButtonText,
                        dumpsters[type].extraWorkAnswer === 'no' && styles.extraWorkButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>

                {dumpsters[type].extraWorkAnswer === 'yes' && (
                  <View style={styles.extraWorkQuantityRow}>
                    <Text style={styles.extraWorkLabel}>Extra work quantity</Text>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          dumpsters[type].extraWorkQuantity === 1 && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => handleExtraWorkQuantityChange(type, -1)}
                        disabled={dumpsters[type].extraWorkQuantity === 1}
                      >
                        <IconSymbol
                          ios_icon_name="minus"
                          android_material_icon_name="remove"
                          size={20}
                          color={colors.white}
                        />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{dumpsters[type].extraWorkQuantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          dumpsters[type].extraWorkQuantity >= dumpsters[type].quantity &&
                            styles.quantityButtonDisabled,
                        ]}
                        onPress={() => handleExtraWorkQuantityChange(type, 1)}
                        disabled={dumpsters[type].extraWorkQuantity >= dumpsters[type].quantity}
                      >
                        <IconSymbol
                          ios_icon_name="plus"
                          android_material_icon_name="add"
                          size={20}
                          color={colors.white}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !hasAnyDumpsters && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!hasAnyDumpsters}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
