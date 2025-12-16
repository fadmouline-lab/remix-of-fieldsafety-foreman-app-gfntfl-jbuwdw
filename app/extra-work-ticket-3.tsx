
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

interface DumpsterQuantities {
  [key: string]: number;
}

const subcontractorTypes = ['Electrical Sub', 'Plumbing Sub', 'Abatement Sub'];
const dumpsterTypes = ['Rubbish', 'Heavy', 'Concrete', 'Scrap', 'ACM', 'Lead'];

export default function ExtraWorkTicketSubsHaulingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workers = params.workers ? JSON.parse(params.workers as string) : [];
  const equipmentQuantities = params.equipmentQuantities
    ? JSON.parse(params.equipmentQuantities as string)
    : {};
  const materialQuantities = params.materialQuantities
    ? JSON.parse(params.materialQuantities as string)
    : {};

  const [subsUsed, setSubsUsed] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  const [dumpsterQuantities, setDumpsterQuantities] = useState<DumpsterQuantities>(
    dumpsterTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );

  const toggleSub = (sub: string) => {
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleQuantityChange = (type: string, delta: number) => {
    setDumpsterQuantities((prev) => ({
      ...prev,
      [type]: Math.max(0, Math.min(12, prev[type] + delta)),
    }));
  };

  const handleNext = () => {
    console.log('Navigating to Extra Work Ticket - Summary');
    router.push({
      pathname: '/extra-work-ticket-4',
      params: {
        workers: JSON.stringify(workers),
        equipmentQuantities: JSON.stringify(equipmentQuantities),
        materialQuantities: JSON.stringify(materialQuantities),
        selectedSubs: JSON.stringify(selectedSubs),
        dumpsterQuantities: JSON.stringify(dumpsterQuantities),
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
        <Text style={styles.headerTitle}>Extra Work Ticket – Subs & Hauling</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subs Section */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.questionText}>
              Did any subcontractors perform extra work?
            </Text>
            <Switch
              value={subsUsed}
              onValueChange={setSubsUsed}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {subsUsed && (
            <View style={styles.subsContainer}>
              {subcontractorTypes.map((sub, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subBox,
                    selectedSubs.includes(sub) && styles.subBoxSelected,
                  ]}
                  onPress={() => toggleSub(sub)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.subText,
                      selectedSubs.includes(sub) && styles.subTextSelected,
                    ]}
                  >
                    {sub}
                  </Text>
                  {selectedSubs.includes(sub) && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Hauling Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dumpsters used for extra work</Text>
          <Text style={styles.sectionDescription}>
            Any dumpsters used today for extra work.
          </Text>

          <View style={styles.dumpstersContainer}>
            {dumpsterTypes.map((type, index) => (
              <View key={index} style={styles.quantityRow}>
                <Text style={styles.dumpsterType}>{type}</Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(type, -1)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name="minus.circle.fill"
                      android_material_icon_name="remove-circle"
                      size={32}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <Text style={styles.quantityValue}>{dumpsterQuantities[type]}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(type, 1)}
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
            ))}
          </View>
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
  subsContainer: {
    gap: 12,
  },
  subBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  subBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  subText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subTextSelected: {
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  dumpstersContainer: {
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
  dumpsterType: {
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
