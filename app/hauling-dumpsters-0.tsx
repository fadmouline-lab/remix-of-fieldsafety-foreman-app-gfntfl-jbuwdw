
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
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const HAULING_COMPANIES = [
  'ABC Hauling',
  'Chicago Waste Co.',
  'Demo Transport',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
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
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage0Screen() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedCompany) return;
    
    router.push({
      pathname: '/hauling-dumpsters-1',
      params: { haulingCompany: selectedCompany },
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
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
        </View>

        <Text style={styles.label}>Select Hauling Company</Text>
        <View style={styles.dropdown}>
          {HAULING_COMPANIES.map((company, index) => (
            <TouchableOpacity
              key={company}
              style={[
                styles.dropdownItem,
                index === HAULING_COMPANIES.length - 1 && styles.dropdownItemLast,
                selectedCompany === company && styles.dropdownItemSelected,
              ]}
              onPress={() => setSelectedCompany(company)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedCompany === company && styles.selectedText,
                ]}
              >
                {company}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedCompany && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedCompany}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
