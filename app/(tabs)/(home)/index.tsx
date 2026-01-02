
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect, useCallback } from 'react';

type TabType = 'todo' | 'more';

interface FormCard {
  id: string;
  titleKey: string;
}

interface CompletedForm {
  id: string;
  type: 'ptp' | 'timecard' | 'activitylog';
  submitted_time: string;
  updated_at?: string;
  revision: number;
  display_time: string;
}

interface HaulingRequest {
  id: string;
  submitted_time: string;
  status: 'pending' | 'sent' | 'failed';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 100,
  },
  projectHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.white,
    marginLeft: 8,
  },
  infoButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  formCardLeft: {
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completedCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  completedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  completedDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusSent: {
    backgroundColor: colors.success,
  },
  statusFailed: {
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function HomeScreen() {
  const { t } = useLanguage();
  const { currentProject, currentEmployee, session, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [haulingRequests, setHaulingRequests] = useState<HaulingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const todoForms: FormCard[] = [
    { id: 'ptp', titleKey: 'DAILY PRE-TASK CHECKLIST' },
    { id: 'timecard', titleKey: 'TIME-CARDS' },
    { id: 'activitylog', titleKey: 'DAILY ACTIVITY LOG' },
  ];

  const manageJobSiteForms: FormCard[] = [
    { id: 'extrawork', titleKey: 'EXTRA WORK TICKETS' },
    { id: 'hauling', titleKey: 'HAULING DUMPSTERS' },
  ];

  const safetyForms: FormCard[] = [
    { id: 'equipment', titleKey: 'EQUIPMENT INSPECTION' },
    { id: 'observation', titleKey: 'OBSERVATION' },
    { id: 'nearmiss', titleKey: 'NEAR MISS' },
    { id: 'incident', titleKey: 'INCIDENT' },
  ];

  const loadCompletedForms = useCallback(async () => {
    if (!currentProject || !session) {
      console.log('No project or session, skipping load');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading completed forms for project:', currentProject.id);

      // Fetch PTP forms
      const { data: ptpData, error: ptpError } = await supabase
        .from('submitted_ptps')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (ptpError) {
        console.error('Error fetching PTPs:', ptpError);
      }

      // Fetch Time Cards
      const { data: timeCardData, error: timeCardError } = await supabase
        .from('time_cards')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (timeCardError) {
        console.error('Error fetching time cards:', timeCardError);
      }

      // Fetch Activity Logs
      const { data: activityLogData, error: activityLogError } = await supabase
        .from('daily_activity_logs')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (activityLogError) {
        console.error('Error fetching activity logs:', activityLogError);
      }

      // Fetch Hauling Requests
      const { data: haulingData, error: haulingError } = await supabase
        .from('hauling_requests')
        .select('id, submitted_time, status')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (haulingError) {
        console.error('Error fetching hauling requests:', haulingError);
      } else {
        console.log('Loaded hauling requests:', haulingData);
        setHaulingRequests(haulingData || []);
      }

      // Combine all forms
      const allForms: CompletedForm[] = [];

      if (ptpData) {
        ptpData.forEach((ptp) => {
          allForms.push({
            id: ptp.id,
            type: 'ptp',
            submitted_time: ptp.submitted_time,
            updated_at: ptp.updated_at,
            revision: ptp.revision,
            display_time: ptp.updated_at || ptp.submitted_time,
          });
        });
      }

      if (timeCardData) {
        timeCardData.forEach((tc) => {
          allForms.push({
            id: tc.id,
            type: 'timecard',
            submitted_time: tc.submitted_time,
            updated_at: tc.updated_at,
            revision: tc.revision,
            display_time: tc.updated_at || tc.submitted_time,
          });
        });
      }

      if (activityLogData) {
        activityLogData.forEach((log) => {
          allForms.push({
            id: log.id,
            type: 'activitylog',
            submitted_time: log.submitted_time,
            updated_at: log.updated_at,
            revision: log.revision,
            display_time: log.updated_at || log.submitted_time,
          });
        });
      }

      // Sort by display_time descending
      allForms.sort((a, b) => {
        return new Date(b.display_time).getTime() - new Date(a.display_time).getTime();
      });

      console.log('Loaded completed forms:', allForms.length);
      setCompletedForms(allForms);
    } catch (error) {
      console.error('Exception loading completed forms:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProject, session]);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, loading completed forms');
      loadCompletedForms();
    }, [loadCompletedForms])
  );

  useEffect(() => {
    if (!session) {
      console.log('No session, redirecting to login');
      router.replace('/login');
    }
  }, [session, router]);

  const handleFormPress = (formTitle: string, formId: string, tabType: TabType) => {
    console.log('Form pressed:', formTitle, formId);

    if (formId === 'ptp') {
      router.push('/pre-task-modal');
    } else if (formId === 'timecard') {
      router.push('/time-cards-1');
    } else if (formId === 'activitylog') {
      router.push('/daily-activity-log-1');
    } else if (formId === 'extrawork') {
      router.push('/extra-work-ticket-1');
    } else if (formId === 'hauling') {
      router.push('/hauling-dumpsters-0');
    } else if (formId === 'equipment') {
      router.push('/equipment-inspection-1');
    } else if (formId === 'observation') {
      router.push('/observation-report-1');
    } else if (formId === 'nearmiss') {
      router.push('/near-miss-report-1');
    } else if (formId === 'incident') {
      router.push('/incident-report-1');
    }
  };

  const handleEditPtpPress = (formId: string) => {
    console.log('Edit PTP pressed:', formId);
    router.push({
      pathname: '/pre-task-select-tasks',
      params: { mode: 'edit', editingId: formId },
    });
  };

  const handleEditTimeCardPress = (formId: string) => {
    console.log('Edit Time Card pressed:', formId);
    router.push({
      pathname: '/time-cards-1',
      params: { mode: 'edit', editingId: formId },
    });
  };

  const handleEditActivityLogPress = (formId: string) => {
    console.log('Edit Activity Log pressed:', formId);
    router.push({
      pathname: '/daily-activity-log-1',
      params: { mode: 'edit', editingId: formId },
    });
  };

  const handleLogout = async () => {
    console.log('Logging out');
    await logout();
    router.replace('/login');
  };

  const handleNavigateToProfile = () => {
    console.log('Navigate to profile');
    router.push('/profile');
  };

  const handleNavigateToSelectProject = () => {
    console.log('Navigate to select project');
    router.push('/select-project');
  };

  const handleDuplicateYesterday = () => {
    console.log('Duplicate yesterday');
    setShowDuplicateModal(false);
    // TODO: Implement duplicate yesterday logic
  };

  const handleStartNew = () => {
    console.log('Start new');
    setShowDuplicateModal(false);
    router.push('/pre-task-select-tasks');
  };

  const handleOpenProjectInfo = () => {
    console.log('Open project info');
    setShowProjectInfo(true);
  };

  const formatSubmittedDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getFormTitle = (type: string) => {
    switch (type) {
      case 'ptp':
        return 'Daily Pre-Task Checklist';
      case 'timecard':
        return 'Time-Cards';
      case 'activitylog':
        return 'Daily Activity Log';
      default:
        return 'Form';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'sent':
        return 'Sent';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'sent':
        return styles.statusSent;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        {/* Project Header */}
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{currentProject?.name || 'Project Name'}</Text>
          <View style={styles.contactRow}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={16}
              color={colors.white}
            />
            <Text style={styles.contactText}>
              Contact: {currentProject?.contact_phone || '(708) 999-7575'}
            </Text>
          </View>
          <TouchableOpacity style={styles.infoButton} onPress={handleOpenProjectInfo}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
            onPress={() => setActiveTab('todo')}
          >
            <Text style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}>
              TO-DO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'more' && styles.activeTab]}
            onPress={() => setActiveTab('more')}
          >
            <Text style={[styles.tabText, activeTab === 'more' && styles.activeTabText]}>
              MORE FORMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* TO-DO Tab */}
        {activeTab === 'todo' && (
          <>
            <Text style={styles.sectionLabel}>TODAY</Text>
            {todoForms.map((form) => (
              <TouchableOpacity
                key={form.id}
                style={styles.formCard}
                onPress={() => handleFormPress(form.titleKey, form.id, 'todo')}
              >
                <View style={styles.formCardLeft}>
                  <Text style={styles.formTitle}>{form.titleKey}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={28}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>COMPLETED FORMS</Text>
            {completedForms.map((form) => (
              <View key={form.id} style={styles.completedCard}>
                <View style={styles.completedCardHeader}>
                  <Text style={styles.completedTitle}>{getFormTitle(form.type)}</Text>
                </View>
                <Text style={styles.completedDate}>
                  Submitted on: {formatSubmittedDate(form.submitted_time)}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (form.type === 'ptp') {
                      handleEditPtpPress(form.id);
                    } else if (form.type === 'timecard') {
                      handleEditTimeCardPress(form.id);
                    } else if (form.type === 'activitylog') {
                      handleEditActivityLogPress(form.id);
                    }
                  }}
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Hauling Requests */}
            {haulingRequests.map((request) => (
              <View key={request.id} style={styles.completedCard}>
                <View style={styles.completedCardHeader}>
                  <Text style={styles.completedTitle}>Hauling Dumpsters</Text>
                </View>
                <Text style={styles.completedDate}>
                  Submitted on: {formatSubmittedDate(request.submitted_time)}
                </Text>
                <View style={[styles.statusPill, getStatusStyle(request.status)]}>
                  <Text style={styles.statusText}>{getStatusLabel(request.status)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* MORE FORMS Tab */}
        {activeTab === 'more' && (
          <>
            <Text style={styles.sectionLabel}>MANAGE JOB-SITE</Text>
            {manageJobSiteForms.map((form) => (
              <TouchableOpacity
                key={form.id}
                style={styles.formCard}
                onPress={() => handleFormPress(form.titleKey, form.id, 'more')}
              >
                <View style={styles.formCardLeft}>
                  <Text style={styles.formTitle}>{form.titleKey}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={28}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>SAFETY</Text>
            {safetyForms.map((form) => (
              <TouchableOpacity
                key={form.id}
                style={styles.formCard}
                onPress={() => handleFormPress(form.titleKey, form.id, 'more')}
              >
                <View style={styles.formCardLeft}>
                  <Text style={styles.formTitle}>{form.titleKey}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={28}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>COMPLETED FORMS</Text>
            {completedForms.map((form) => (
              <View key={form.id} style={styles.completedCard}>
                <View style={styles.completedCardHeader}>
                  <Text style={styles.completedTitle}>{getFormTitle(form.type)}</Text>
                </View>
                <Text style={styles.completedDate}>
                  Submitted on: {formatSubmittedDate(form.submitted_time)}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (form.type === 'ptp') {
                      handleEditPtpPress(form.id);
                    } else if (form.type === 'timecard') {
                      handleEditTimeCardPress(form.id);
                    } else if (form.type === 'activitylog') {
                      handleEditActivityLogPress(form.id);
                    }
                  }}
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Hauling Requests */}
            {haulingRequests.map((request) => (
              <View key={request.id} style={styles.completedCard}>
                <View style={styles.completedCardHeader}>
                  <Text style={styles.completedTitle}>Hauling Dumpsters</Text>
                </View>
                <Text style={styles.completedDate}>
                  Submitted on: {formatSubmittedDate(request.submitted_time)}
                </Text>
                <View style={[styles.statusPill, getStatusStyle(request.status)]}>
                  <Text style={styles.statusText}>{getStatusLabel(request.status)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Project Info Modal */}
      <Modal visible={showProjectInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Project Info</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowProjectInfo(false);
                router.push('/(tabs)/(home)/project-info-modal');
              }}
            >
              <Text style={styles.modalButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowProjectInfo(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
