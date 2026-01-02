
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';

type DumpsterType = 'Rubbish' | 'Heavy' | 'Concrete' | 'Scrap' | 'ACM' | 'Lead';

interface DumpsterData {
  quantity: number;
  extraWorkAnswer: 'yes' | 'no' | null;
  extraWorkQuantity: number;
}

type DumpsterQuantities = Record<DumpsterType, DumpsterData>;

const DUMPSTER_TYPES: DumpsterType[] = ['Rubbish', 'Heavy', 'Concrete', 'Scrap', 'ACM', 'Lead'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  dumpsterCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dumpsterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dumpsterName: {
    fontSize: 17,
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
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  extraWorkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  extraWorkButton: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  extraWorkButtonTextSelected: {
    color: colors.white,
  },
  extraWorkQuantitySection: {
    marginTop: 12,
  },
  extraWorkLabel: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

const createEmptyDumpsterData = (): DumpsterQuantities => {
  const data: Partial<DumpsterQuantities> = {};
  DUMPSTER_TYPES.forEach((type) => {
    data[type] = {
      quantity: 0,
      extraWorkAnswer: null,
      extraWorkQuantity: 1,
    };
  });
  return data as DumpsterQuantities;
};

export default function HaulingDumpstersPage1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const haulingCompanyId = params.haulingCompanyId as string;
  const haulingCompanyName = params.haulingCompanyName as string;
  const haulingCompanyPhone = params.haulingCompanyPhone as string;
  const haulingCompanyEmail = params.haulingCompanyEmail as string;
  const haulingCompanyContact = params.haulingCompanyContact as string;

  const [activeTab, setActiveTab] = useState<'add' | 'replace'>('add');
  const [addDumpsters, setAddDumpsters] = useState<DumpsterQuantities>(createEmptyDumpsterData());
  const [replaceDumpsters, setReplaceDumpsters] = useState<DumpsterQuantities>(createEmptyDumpsterData());

  const currentDumpsters = activeTab === 'add' ? addDumpsters : replaceDumpsters;
  const setCurrentDumpsters = activeTab === 'add' ? setAddDumpsters : setReplaceDumpsters;

  const handleQuantityChange = (type: DumpsterType, delta: number) => {
    setCurrentDumpsters((prev) => {
      const newQuantity = Math.max(0, prev[type].quantity + delta);
      return {
        ...prev,
        [type]: {
          ...prev[type],
          quantity: newQuantity,
          extraWorkAnswer: newQuantity === 0 ? null : prev[type].extraWorkAnswer,
          extraWorkQuantity: newQuantity === 0 ? 1 : Math.min(prev[type].extraWorkQuantity, newQuantity),
        },
      };
    });
  };

  const handleExtraWorkAnswer = (type: DumpsterType, answer: 'yes' | 'no') => {
    setCurrentDumpsters((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraWorkAnswer: answer,
        extraWorkQuantity: answer === 'yes' ? 1 : 1,
      },
    }));
  };

  const handleExtraWorkQuantityChange = (type: DumpsterType, delta: number) => {
    setCurrentDumpsters((prev) => {
      const maxQuantity = prev[type].quantity;
      const newExtraQuantity = Math.max(1, Math.min(maxQuantity, prev[type].extraWorkQuantity + delta));
      return {
        ...prev,
        [type]: {
          ...prev[type],
          extraWorkQuantity: newExtraQuantity,
        },
      };
    });
  };

  const handleNext = () => {
    router.push({
      pathname: '/hauling-dumpsters-2',
      params: {
        haulingCompanyId,
        haulingCompanyName,
        haulingCompanyPhone,
        haulingCompanyEmail,
        haulingCompanyContact,
        addDumpsters: JSON.stringify(addDumpsters),
        replaceDumpsters: JSON.stringify(replaceDumpsters),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Dumpsters</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'add' && styles.tabActive]}
            onPress={() => setActiveTab('add')}
          >
            <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
              Add Dumpsters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'replace' && styles.tabActive]}
            onPress={() => setActiveTab('replace')}
          >
            <Text style={[styles.tabText, activeTab === 'replace' && styles.tabTextActive]}>
              Replace Dumpsters
            </Text>
          </TouchableOpacity>
        </View>

        {DUMPSTER_TYPES.map((type) => {
          const data = currentDumpsters[type];
          return (
            <View key={type} style={styles.dumpsterCard}>
              <View style={styles.dumpsterHeader}>
                <Text style={styles.dumpsterName}>{type}</Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      data.quantity === 0 && styles.quantityButtonDisabled,
                    ]}
                    onPress={() => handleQuantityChange(type, -1)}
                    disabled={data.quantity === 0}
                  >
                    <IconSymbol
                      ios_icon_name="minus"
                      android_material_icon_name="remove"
                      size={20}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{data.quantity}</Text>
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

              {data.quantity > 0 && (
                <View style={styles.extraWorkSection}>
                  <Text style={styles.extraWorkQuestion}>
                    Are any of these dumpsters for extra work?
                  </Text>
                  <View style={styles.extraWorkButtons}>
                    <TouchableOpacity
                      style={[
                        styles.extraWorkButton,
                        data.extraWorkAnswer === 'yes' && styles.extraWorkButtonSelected,
                      ]}
                      onPress={() => handleExtraWorkAnswer(type, 'yes')}
                    >
                      <Text
                        style={[
                          styles.extraWorkButtonText,
                          data.extraWorkAnswer === 'yes' && styles.extraWorkButtonTextSelected,
                        ]}
                      >
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.extraWorkButton,
                        data.extraWorkAnswer === 'no' && styles.extraWorkButtonSelected,
                      ]}
                      onPress={() => handleExtraWorkAnswer(type, 'no')}
                    >
                      <Text
                        style={[
                          styles.extraWorkButtonText,
                          data.extraWorkAnswer === 'no' && styles.extraWorkButtonTextSelected,
                        ]}
                      >
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {data.extraWorkAnswer === 'yes' && (
                    <View style={styles.extraWorkQuantitySection}>
                      <Text style={styles.extraWorkLabel}>Extra work quantity</Text>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            data.extraWorkQuantity === 1 && styles.quantityButtonDisabled,
                          ]}
                          onPress={() => handleExtraWorkQuantityChange(type, -1)}
                          disabled={data.extraWorkQuantity === 1}
                        >
                          <IconSymbol
                            ios_icon_name="minus"
                            android_material_icon_name="remove"
                            size={20}
                            color={colors.white}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{data.extraWorkQuantity}</Text>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            data.extraWorkQuantity >= data.quantity && styles.quantityButtonDisabled,
                          ]}
                          onPress={() => handleExtraWorkQuantityChange(type, 1)}
                          disabled={data.extraWorkQuantity >= data.quantity}
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
          );
        })}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
