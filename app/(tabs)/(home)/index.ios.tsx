
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol.ios';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
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

type TabType = 'todo' | 'more';

interface FormCard {
  id: string;
  titleKey: string;
}

interface CompletedForm {
  id: string;
  titleKey: string;
  submittedDate: string;
}

interface HaulingRequest {
  id: string;
  submitted_time: string;
  status: 'pending' | 'sent' | 'failed';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  projectHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    top: 60,
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
  const [haulingRequests, setHaulingRequests] = useState<HaulingRequest[]>([]);
  const [loading, setLoading] = useState(false);

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

  const completedForms: CompletedForm[] = [
    { id: '1', titleKey: 'Daily Pre-Task Checklist', submittedDate: 'May 4th 2023' },
    { id: '2', titleKey: 'Time-Cards', submittedDate: 'May 4th 2023' },
    { id: '3', titleKey: 'Daily Activity Log', submittedDate: 'May 4th 2023' },
  ];

  const loadProjectInfo = useCallback(async () => {
    if (!currentProject) {
      console.log('No current project');
      return;
    }

    try {
      console.log('Loading project info for:', currentProject.id);

      // Fetch hauling requests
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
    } catch (error) {
      console.error('Exception loading project info:', error);
    }
  }, [currentProject]);

  const handleDownloadDocument = async (
    bucket: string,
    path: string,
    documentName: string
  ) => {
    console.log('Download document:', documentName);
    // TODO: Implement document download
  };

  const handleFormPress = (formTitle: string, formId: string) => {
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

  const handleEditPress = (formId: string) => {
    console.log('Edit pressed:', formId);
    // TODO: Implement edit functionality
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
    // TODO: Implement duplicate yesterday logic
  };

  const handleStartNew = () => {
    console.log('Start new');
    router.push('/pre-task-select-tasks');
  };

  const handleOpenProjectInfo = () => {
    console.log('Open project info');
    router.push('/(tabs)/(home)/project-info-modal');
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

  React.useEffect(() => {
    loadProjectInfo();
  }, [loadProjectInfo]);

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
                onPress={() => handleFormPress(form.titleKey, form.id)}
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
                  <Text style={styles.completedTitle}>{form.titleKey}</Text>
                </View>
                <Text style={styles.completedDate}>Submitted on: {form.submittedDate}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
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
                onPress={() => handleFormPress(form.titleKey, form.id)}
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
                onPress={() => handleFormPress(form.titleKey, form.id)}
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
                  <Text style={styles.completedTitle}>{form.titleKey}</Text>
                </View>
                <Text style={styles.completedDate}>Submitted on: {form.submittedDate}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPress(form.id)}
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
    </View>
  );
}
