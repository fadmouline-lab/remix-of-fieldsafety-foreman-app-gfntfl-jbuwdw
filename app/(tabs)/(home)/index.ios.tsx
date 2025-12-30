
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

interface ProjectInfo {
  projectName: string;
  projectAddress: string;
  projectManager: {
    name: string;
    phone: string;
  } | null;
  superintendent: {
    name: string;
    phone: string;
  } | null;
  safetyManager: {
    name: string;
    phone: string;
  } | null;
  emergencyFacility: string | null;
  emergencyFacilityAddress: string | null;
  jhaDocument: {
    bucket: string;
    path: string;
  } | null;
  safetyPlanDocument: {
    bucket: string;
    path: string;
  } | null;
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
  const { currentProject, currentEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('TODO');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [preTaskModalVisible, setPreTaskModalVisible] = useState(false);
  const [projectInfoModalVisible, setProjectInfoModalVisible] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loadingProjectInfo, setLoadingProjectInfo] = useState(false);

  const loadProjectInfo = async () => {
    if (!currentProject || !currentEmployee) {
      console.log('Cannot load project info: missing project or employee');
      return;
    }

    console.log('Loading project information...');
    setLoadingProjectInfo(true);

    try {
      // Fetch safety plan data
      const { data: safetyPlanData, error: safetyPlanError } = await supabase
        .from('safety_plans')
        .select(`
          project_manager_assignment_id,
          superintendent_assignment_id,
          safety_rep_assignment_id,
          emergency_facility_name,
          emergency_facility_address,
          document_bucket,
          document_path
        `)
        .eq('project_id', currentProject.id)
        .single();

      if (safetyPlanError) {
        console.error('Error fetching safety plan:', safetyPlanError);
      }

      // Fetch JHA document data
      const { data: jhaData, error: jhaError } = await supabase
        .from('jha_reports')
        .select('document_bucket, document_path')
        .eq('project_id', currentProject.id)
        .single();

      if (jhaError && jhaError.code !== 'PGRST116') {
        console.error('Error fetching JHA report:', jhaError);
      }

      // Helper function to fetch employee data from assignment ID
      const fetchEmployeeFromAssignment = async (assignmentId: string | null) => {
        if (!assignmentId) {
          return null;
        }

        try {
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('project_assignments')
            .select('employee_id')
            .eq('id', assignmentId)
            .single();

          if (assignmentError || !assignmentData) {
            console.error('Error fetching assignment:', assignmentError);
            return null;
          }

          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('first_name, last_name, phone_number')
            .eq('id', assignmentData.employee_id)
            .single();

          if (employeeError || !employeeData) {
            console.error('Error fetching employee:', employeeError);
            return null;
          }

          return {
            name: `${employeeData.first_name} ${employeeData.last_name}`,
            phone: employeeData.phone_number || 'Not available',
          };
        } catch (error) {
          console.error('Exception fetching employee from assignment:', error);
          return null;
        }
      };

      // Fetch project manager, superintendent, and safety manager
      const projectManager = safetyPlanData?.project_manager_assignment_id
        ? await fetchEmployeeFromAssignment(safetyPlanData.project_manager_assignment_id)
        : null;

      const superintendent = safetyPlanData?.superintendent_assignment_id
        ? await fetchEmployeeFromAssignment(safetyPlanData.superintendent_assignment_id)
        : null;

      const safetyManager = safetyPlanData?.safety_rep_assignment_id
        ? await fetchEmployeeFromAssignment(safetyPlanData.safety_rep_assignment_id)
        : null;

      const info: ProjectInfo = {
        projectName: currentProject.name,
        projectAddress: currentProject.location || 'Not available',
        projectManager,
        superintendent,
        safetyManager,
        emergencyFacility: safetyPlanData?.emergency_facility_name || null,
        emergencyFacilityAddress: safetyPlanData?.emergency_facility_address || null,
        jhaDocument: jhaData?.document_bucket && jhaData?.document_path
          ? { bucket: jhaData.document_bucket, path: jhaData.document_path }
          : null,
        safetyPlanDocument: safetyPlanData?.document_bucket && safetyPlanData?.document_path
          ? { bucket: safetyPlanData.document_bucket, path: safetyPlanData.document_path }
          : null,
      };

      console.log('Project info loaded:', info);
      setProjectInfo(info);
    } catch (error) {
      console.error('Exception loading project info:', error);
      Alert.alert('Error', 'Failed to load project information');
    } finally {
      setLoadingProjectInfo(false);
    }
  };

  const handleDownloadDocument = async (bucket: string, path: string, documentName: string) => {
    try {
      console.log(`Generating signed URL for ${documentName}...`);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 180); // 180 seconds = 3 minutes

      if (error) {
        console.error('Error generating signed URL:', error);
        Alert.alert('Error', 'Failed to generate download link');
        return;
      }

      if (data?.signedUrl) {
        console.log('Opening document:', data.signedUrl);
        await Linking.openURL(data.signedUrl);
      } else {
        Alert.alert('Error', 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Exception downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const handleFormPress = (formTitle: string, formId: string) => {
    console.log('Form pressed:', formTitle);
    if (formId === '1' && activeTab === 'TODO') {
      setPreTaskModalVisible(true);
    } else if (formId === '2' && activeTab === 'TODO') {
      router.push('/time-cards-1');
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

  const handleOpenProjectInfo = () => {
    setProjectInfoModalVisible(true);
    loadProjectInfo();
  };

  const projectName = currentProject?.name || 'UIC Project';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.projectName}>{projectName}</Text>
            <TouchableOpacity 
              style={styles.contactRow}
              onPress={handleOpenProjectInfo}
            >
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.contactText}>Project Information</Text>
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

      {/* Project Information Modal */}
      <Modal
        visible={projectInfoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProjectInfoModalVisible(false)}
      >
        <View style={styles.projectInfoOverlay}>
          <View style={styles.projectInfoContainer}>
            <View style={styles.projectInfoHeader}>
              <Text style={styles.projectInfoTitle}>Project Information</Text>
              <TouchableOpacity
                onPress={() => setProjectInfoModalVisible(false)}
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

            {loadingProjectInfo ? (
              <View style={styles.projectInfoLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading project information...</Text>
              </View>
            ) : projectInfo ? (
              <ScrollView 
                style={styles.projectInfoScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Project Name</Text>
                  <Text style={styles.infoValue}>{projectInfo.projectName}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Project Address</Text>
                  <Text style={styles.infoValue}>{projectInfo.projectAddress}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Project Manager</Text>
                  {projectInfo.projectManager ? (
                    <React.Fragment>
                      <Text style={styles.infoValue}>{projectInfo.projectManager.name}</Text>
                      <Text style={styles.infoValueSecondary}>{projectInfo.projectManager.phone}</Text>
                    </React.Fragment>
                  ) : (
                    <Text style={styles.infoValueNotAssigned}>Not assigned</Text>
                  )}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Superintendent</Text>
                  {projectInfo.superintendent ? (
                    <React.Fragment>
                      <Text style={styles.infoValue}>{projectInfo.superintendent.name}</Text>
                      <Text style={styles.infoValueSecondary}>{projectInfo.superintendent.phone}</Text>
                    </React.Fragment>
                  ) : (
                    <Text style={styles.infoValueNotAssigned}>Not assigned</Text>
                  )}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Safety Manager</Text>
                  {projectInfo.safetyManager ? (
                    <React.Fragment>
                      <Text style={styles.infoValue}>{projectInfo.safetyManager.name}</Text>
                      <Text style={styles.infoValueSecondary}>{projectInfo.safetyManager.phone}</Text>
                    </React.Fragment>
                  ) : (
                    <Text style={styles.infoValueNotAssigned}>Not assigned</Text>
                  )}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Emergency Facility</Text>
                  <Text style={styles.infoValue}>
                    {projectInfo.emergencyFacility || 'Not available'}
                  </Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Emergency Facility Address</Text>
                  <Text style={styles.infoValue}>
                    {projectInfo.emergencyFacilityAddress || 'Not available'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.documentsTitle}>Project Documents</Text>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Project Job Hazard Analysis</Text>
                  {projectInfo.jhaDocument ? (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() =>
                        handleDownloadDocument(
                          projectInfo.jhaDocument!.bucket,
                          projectInfo.jhaDocument!.path,
                          'JHA'
                        )
                      }
                    >
                      <IconSymbol
                        ios_icon_name="arrow.down.circle.fill"
                        android_material_icon_name="download"
                        size={20}
                        color={colors.card}
                      />
                      <Text style={styles.downloadButtonText}>Download JHA</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoValueNotAssigned}>Not available</Text>
                  )}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Project Site Specific Safety Plan</Text>
                  {projectInfo.safetyPlanDocument ? (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() =>
                        handleDownloadDocument(
                          projectInfo.safetyPlanDocument!.bucket,
                          projectInfo.safetyPlanDocument!.path,
                          'Safety Plan'
                        )
                      }
                    >
                      <IconSymbol
                        ios_icon_name="arrow.down.circle.fill"
                        android_material_icon_name="download"
                        size={20}
                        color={colors.card}
                      />
                      <Text style={styles.downloadButtonText}>Download Safety Plan</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoValueNotAssigned}>Not available</Text>
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.projectInfoLoading}>
                <Text style={styles.infoValueNotAssigned}>
                  Failed to load project information
                </Text>
              </View>
            )}
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
    paddingTop: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  settingsMenu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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
  projectInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  projectInfoContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  projectInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  projectInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  projectInfoLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  projectInfoScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 22,
  },
  infoValueSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoValueNotAssigned: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
