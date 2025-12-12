
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';

type TabType = 'TODO' | 'MORE_FORMS';

interface FormCard {
  id: string;
  title: string;
  icon?: string;
}

interface CompletedForm {
  id: string;
  title: string;
  submittedDate: string;
}

const todoForms: FormCard[] = [
  { id: '1', title: 'DAILY PRE-TASK CHECKLIST' },
  { id: '2', title: 'TIME-CARDS' },
  { id: '3', title: 'DAILY ACTIVITY LOG' },
];

const completedForms: CompletedForm[] = [
  { id: '1', title: 'Daily Pre-Task Checklist', submittedDate: 'May 4th 2023' },
  { id: '2', title: 'Time-Cards', submittedDate: 'May 4th 2023' },
  { id: '3', title: 'Daily Activity Log', submittedDate: 'May 4th 2023' },
];

const manageJobSiteForms: FormCard[] = [
  { id: '1', title: 'EXTRA WORK TICKETS' },
  { id: '2', title: 'HAULING DUMPSTERS' },
];

const safetyForms: FormCard[] = [
  { id: '1', title: 'EQUIPMENT INSPECTION' },
  { id: '2', title: 'OBSERVATION' },
  { id: '3', title: 'NEAR MISS' },
  { id: '4', title: 'INCIDENT' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('TODO');

  const handleFormPress = (formTitle: string) => {
    console.log('Form pressed:', formTitle);
  };

  const handleEditPress = (formId: string) => {
    console.log('Edit pressed for form:', formId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.projectName}>UIC Project</Text>
        <TouchableOpacity style={styles.contactRow}>
          <IconSymbol
            ios_icon_name="phone.fill"
            android_material_icon_name="phone"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.contactText}>Contact: (708) 999-7575</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'TODO' && styles.tabActive]}
          onPress={() => setActiveTab('TODO')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'TODO' && styles.tabTextActive,
            ]}
          >
            TO-DO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'MORE_FORMS' && styles.tabActive]}
          onPress={() => setActiveTab('MORE_FORMS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'MORE_FORMS' && styles.tabTextActive,
            ]}
          >
            MORE FORMS
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'TODO' ? (
          <View>
            <Text style={styles.sectionTitle}>TODAY</Text>
            {todoForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(form.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{form.title}</Text>
                <View style={styles.addIconContainer}>
                  <IconSymbol
                    ios_icon_name="plus.circle.fill"
                    android_material_icon_name="add-circle"
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
              Completed Forms
            </Text>
            {completedForms.map((form, index) => (
              <View key={index} style={styles.completedCard}>
                <View style={styles.completedCardContent}>
                  <Text style={styles.completedFormTitle}>{form.title}</Text>
                  <Text style={styles.submittedDate}>
                    Submitted on: {form.submittedDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Manage Job-Site</Text>
            {manageJobSiteForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(form.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{form.title}</Text>
                <View style={styles.addIconContainer}>
                  <IconSymbol
                    ios_icon_name="plus.circle.fill"
                    android_material_icon_name="add-circle"
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
              Safety
            </Text>
            {safetyForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(form.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{form.title}</Text>
                <View style={styles.addIconContainer}>
                  <IconSymbol
                    ios_icon_name="plus.circle.fill"
                    android_material_icon_name="add-circle"
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
              Completed Forms
            </Text>
            {completedForms.map((form, index) => (
              <View key={index} style={styles.completedCard}>
                <View style={styles.completedCardContent}>
                  <Text style={styles.completedFormTitle}>{form.title}</Text>
                  <Text style={styles.submittedDate}>
                    Submitted on: {form.submittedDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  projectName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionTitleMargin: {
    marginTop: 24,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    letterSpacing: 0.5,
  },
  addIconContainer: {
    marginLeft: 12,
  },
  completedCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedCardContent: {
    flex: 1,
  },
  completedFormTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  submittedDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editButton: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.5,
  },
});
