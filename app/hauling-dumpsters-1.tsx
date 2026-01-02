
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

type DumpsterType = '10 Yard' | '20 Yard' | '30 Yard' | '40 Yard';

interface DumpsterData {
  type: DumpsterType;
  quantity: number;
  isExtraWork: boolean | null;
  extraWorkQuantity: number;
}

const DUMPSTER_TYPES: DumpsterType[] = ['10 Yard', '20 Yard', '30 Yard', '40 Yard'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  dumpsterCard: {
    backgroundColor: '#fff',
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
  dumpsterType: {
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
  yesNoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  yesNoButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yesNoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  yesNoButtonTextSelected: {
    color: '#fff',
  },
  extraWorkQuantitySection: {
    marginTop: 12,
  },
  extraWorkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
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
  const haulingCompany = params.haulingCompany as string;

  const [addDumpsters, setAddDumpsters] = useState<Record<DumpsterType, DumpsterData>>(
    DUMPSTER_TYPES.reduce((acc, type) => ({
      ...acc,
      [type]: { type, quantity: 0, isExtraWork: null, extraWorkQuantity: 1 },
    }), {} as Record<DumpsterType, DumpsterData>)
  );

  const [replaceDumpsters, setReplaceDumpsters] = useState<Record<DumpsterType, DumpsterData>>(
    DUMPSTER_TYPES.reduce((acc, type) => ({
      ...acc,
      [type]: { type, quantity: 0, isExtraWork: null, extraWorkQuantity: 1 },
    }), {} as Record<DumpsterType, DumpsterData>)
  );

  const updateQuantity = (
    section: 'add' | 'replace',
    type: DumpsterType,
    delta: number
  ) => {
    const setState = section === 'add' ? setAddDumpsters : setReplaceDumpsters;
    setState((prev) => {
      const current = prev[type];
      const newQuantity = Math.max(0, current.quantity + delta);
      
      return {
        ...prev,
        [type]: {
          ...current,
          quantity: newQuantity,
          isExtraWork: newQuantity === 0 ? null : current.isExtraWork,
          extraWorkQuantity: Math.min(current.extraWorkQuantity, newQuantity || 1),
        },
      };
    });
  };

  const setExtraWork = (
    section: 'add' | 'replace',
    type: DumpsterType,
    value: boolean
  ) => {
    const setState = section === 'add' ? setAddDumpsters : setReplaceDumpsters;
    setState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        isExtraWork: value,
        extraWorkQuantity: value ? 1 : 0,
      },
    }));
  };

  const updateExtraWorkQuantity = (
    section: 'add' | 'replace',
    type: DumpsterType,
    delta: number
  ) => {
    const setState = section === 'add' ? setAddDumpsters : setReplaceDumpsters;
    setState((prev) => {
      const current = prev[type];
      const newQuantity = Math.max(1, Math.min(current.quantity, current.extraWorkQuantity + delta));
      
      return {
        ...prev,
        [type]: {
          ...current,
          extraWorkQuantity: newQuantity,
        },
      };
    });
  };

  const handleNext = () => {
    const addData = Object.values(addDumpsters).filter(d => d.quantity > 0);
    const replaceData = Object.values(replaceDumpsters).filter(d => d.quantity > 0);

    router.push({
      pathname: '/hauling-dumpsters-2',
      params: {
        haulingCompany,
        addDumpsters: JSON.stringify(addData),
        replaceDumpsters: JSON.stringify(replaceData),
      },
    });
  };

  const renderDumpsterCard = (
    type: DumpsterType,
    data: DumpsterData,
    section: 'add' | 'replace'
  ) => (
    <View key={type} style={styles.dumpsterCard}>
      <View style={styles.dumpsterHeader}>
        <Text style={styles.dumpsterType}>{type}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              data.quantity === 0 && styles.quantityButtonDisabled,
            ]}
            onPress={() => updateQuantity(section, type, -1)}
            disabled={data.quantity === 0}
          >
            <IconSymbol name="minus" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{data.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(section, type, 1)}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {data.quantity > 0 && (
        <View style={styles.extraWorkSection}>
          <Text style={styles.extraWorkQuestion}>
            Are any of these dumpsters for extra work?
          </Text>
          <View style={styles.yesNoButtons}>
            <TouchableOpacity
              style={[
                styles.yesNoButton,
                data.isExtraWork === true && styles.yesNoButtonSelected,
              ]}
              onPress={() => setExtraWork(section, type, true)}
            >
              <Text
                style={[
                  styles.yesNoButtonText,
                  data.isExtraWork === true && styles.yesNoButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.yesNoButton,
                data.isExtraWork === false && styles.yesNoButtonSelected,
              ]}
              onPress={() => setExtraWork(section, type, false)}
            >
              <Text
                style={[
                  styles.yesNoButtonText,
                  data.isExtraWork === false && styles.yesNoButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {data.isExtraWork === true && (
            <View style={styles.extraWorkQuantitySection}>
              <Text style={styles.extraWorkLabel}>Extra work quantity</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    data.extraWorkQuantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => updateExtraWorkQuantity(section, type, -1)}
                  disabled={data.extraWorkQuantity === 1}
                >
                  <IconSymbol name="minus" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{data.extraWorkQuantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    data.extraWorkQuantity === data.quantity && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => updateExtraWorkQuantity(section, type, 1)}
                  disabled={data.extraWorkQuantity === data.quantity}
                >
                  <IconSymbol name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Select Dumpsters</Text>
        <Text style={styles.subtitle}>
          Choose the dumpsters you need to add or replace
        </Text>

        <Text style={styles.sectionTitle}>Add Dumpsters</Text>
        {DUMPSTER_TYPES.map((type) =>
          renderDumpsterCard(type, addDumpsters[type], 'add')
        )}

        <Text style={styles.sectionTitle}>Replace Dumpsters</Text>
        {DUMPSTER_TYPES.map((type) =>
          renderDumpsterCard(type, replaceDumpsters[type], 'replace')
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
