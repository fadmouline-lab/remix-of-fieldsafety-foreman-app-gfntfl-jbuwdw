
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

type TabType = 'TODO' | 'MORE_FORMS';

interface FormCard {
  id: string;
  titleKey: string;
}

interface CompletedForm {
  id: string;
  titleKey: string;
  submittedDate: string;
}

const todoForms: FormCard[] = [
  { id: '1', titleKey: 'forms.dailyPreTask' },
  { id: '2', titleKey: 'forms.timeCards' },
  { id: '3', titleKey: 'forms.dailyActivityLog' },
];

const completedForms: CompletedForm[] = [
  { id: '1', titleKey: 'forms.dailyPreTaskCompleted', submittedDate: 'May 4th 2023' },
  { id: '2', titleKey: 'forms.timeCardsCompleted', submittedDate: 'May 4th 2023' },
  { id: '3', titleKey: 'forms.dailyActivityLogCompleted', submittedDate: 'May 4th 2023' },
];

const manageJobSiteForms: FormCard[] = [
  { id: '1', titleKey: 'forms.extraWorkTickets' },
  { id: '2', titleKey: 'forms.haulingDumpsters' },
];

const safetyForms: FormCard[] = [
  { id: '1', titleKey: 'forms.equipmentInspection' },
  { id: '2', titleKey: 'forms.observation' },
  { id: '3', titleKey: 'forms.nearMiss' },
  { id: '4', titleKey: 'forms.incident' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('TODO');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [preTaskModalVisible, setPreTaskModalVisible] = useState(false);

  const handleFormPress = (formTitle: string, formId: string) => {
    console.log('Form pressed:', formTitle);
    if (formId === '1' && activeTab === 'TODO') {
      setPreTaskModalVisible(true);
    } else if (formId === '3' && activeTab === 'TODO') {
      router.push('/daily-activity-log-1');
    }
  };

  const handleEditPress = (formId: string) => {
    console.log('Edit pressed for form:', formId);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setSettingsVisible(false);
    router.replace('/login');
  };

  const handleNavigateToProfile = () => {
    setSettingsVisible(false);
    router.push('/profile');
  };

  const handleNavigateToSelectProject = () => {
    setSettingsVisible(false);
    router.push('/select-project');
  };

  const handleDuplicateYesterday = () => {
    setPreTaskModalVisible(false);
    router.push('/pre-task-duplicate');
  };

  const handleStartNew = () => {
    setPreTaskModalVisible(false);
    router.push('/pre-task-select-tasks');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.projectName}>UIC Project</Text>
            <TouchableOpacity style={styles.contactRow}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.contactText}>{t('home.contact')} (708) 999-7575</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
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
            {t('home.todo')}
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
            {t('home.moreForms')}
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
            <Text style={styles.sectionTitle}>{t('home.today')}</Text>
            {todoForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(t(form.titleKey), form.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{t(form.titleKey)}</Text>
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
              {t('home.completedForms')}
            </Text>
            {completedForms.map((form, index) => (
              <View key={index} style={styles.completedCard}>
                <View style={styles.completedCardContent}>
                  <Text style={styles.completedFormTitle}>{t(form.titleKey)}</Text>
                  <Text style={styles.submittedDate}>
                    {t('home.submittedOn')} {form.submittedDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
                >
                  <Text style={styles.editButtonText}>{t('home.edit')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>{t('home.manageJobSite')}</Text>
            {manageJobSiteForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(t(form.titleKey), form.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{t(form.titleKey)}</Text>
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
              {t('home.safety')}
            </Text>
            {safetyForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(t(form.titleKey), form.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{t(form.titleKey)}</Text>
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
              {t('home.completedForms')}
            </Text>
            {completedForms.map((form, index) => (
              <View key={index} style={styles.completedCard}>
                <View style={styles.completedCardContent}>
                  <Text style={styles.completedFormTitle}>{t(form.titleKey)}</Text>
                  <Text style={styles.submittedDate}>
                    {t('home.submittedOn')} {form.submittedDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
                >
                  <Text style={styles.editButtonText}>{t('home.edit')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={styles.settingsMenu}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t('settings.title')}</Text>
              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNavigateToSelectProject}
            >
              <IconSymbol
                ios_icon_name="folder.fill"
                android_material_icon_name="folder"
                size={20}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>{t('settings.selectProject')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNavigateToProfile}
            >
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>{t('settings.profile')}</Text>
            </TouchableOpacity>

            <View style={styles.languageSection}>
              <Text style={styles.languageLabel}>{t('settings.language')}</Text>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === 'en' && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === 'en' && styles.languageButtonTextActive,
                    ]}
                  >
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === 'es' && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage('es')}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === 'es' && styles.languageButtonTextActive,
                    ]}
                  >
                    Español
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <IconSymbol
                ios_icon_name="arrow.right.square.fill"
                android_material_icon_name="logout"
                size={20}
                color={colors.secondary}
              />
              <Text style={styles.logoutText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Pre-Task Modal */}
      <Modal
        visible={preTaskModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreTaskModalVisible(false)}
      >
        <View style={styles.preTaskOverlay}>
          <View style={styles.preTaskModalContainer}>
            <View style={styles.preTaskHeader}>
              <Text style={styles.preTaskTitle}>Pre-Task Card</Text>
              <TouchableOpacity
                onPress={() => setPreTaskModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.preTaskButtonContainer}>
              <TouchableOpacity
                style={styles.preTaskOptionButton}
                onPress={handleDuplicateYesterday}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="doc.on.doc.fill"
                  android_material_icon_name="content-copy"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.preTaskButtonText}>Duplicate Yesterday</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.preTaskOptionButton}
                onPress={handleStartNew}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.preTaskButtonText}>Start New</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  settingsButton: {
    padding: 8,
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingRight: 20,
  },
  settingsMenu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    maxWidth: 320,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  languageSection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  languageLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 12,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  languageButtonTextActive: {
    color: colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '600',
  },
  preTaskOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preTaskModalContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  preTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  preTaskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  preTaskButtonContainer: {
    gap: 16,
  },
  preTaskOptionButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  preTaskButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
});
