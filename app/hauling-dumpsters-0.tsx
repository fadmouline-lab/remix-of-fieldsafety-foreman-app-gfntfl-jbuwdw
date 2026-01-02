
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';

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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
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

export default function HaulingDumpstersPage0Screen() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNext = () => {
    if (!selectedCompany) return;
    
    router.push({
      pathname: '/hauling-dumpsters-1',
      params: { haulingCompany: selectedCompany },
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
        <Text style={styles.label}>Select Hauling Company</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
        >
          <Text
            style={
              selectedCompany
                ? styles.dropdownButtonText
                : styles.dropdownPlaceholder
            }
          >
            {selectedCompany || 'Choose a company...'}
          </Text>
          <IconSymbol
            ios_icon_name="chevron.down"
            android_material_icon_name="arrow-drop-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
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

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hauling Company</Text>
            </View>
            <ScrollView>
              {HAULING_COMPANIES.map((company) => (
                <TouchableOpacity
                  key={company}
                  style={[
                    styles.optionItem,
                    selectedCompany === company && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelectedCompany(company);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.optionText}>{company}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
