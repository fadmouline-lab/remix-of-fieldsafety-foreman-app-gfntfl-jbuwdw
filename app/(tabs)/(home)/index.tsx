
import { useLanguage } from '@/contexts/LanguageContext';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type TabType = 'todo' | 'moreForms';

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

interface InjuryReport {
  id: string;
  reported_at: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
}

export default function HomeScreen() {
  const { currentEmployee, currentProject, session } = useAuth();
  const router = useRouter();
  
  useFocusEffect(
    useCallback(() => {
      if (!session) {
        router.replace('/login');
      }
    }, [session])
  );

  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [haulingRequests, setHaulingRequests] = useState<HaulingRequest[]>([]);
  const [injuryReports, setInjuryReports] = useState<InjuryReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentProject || !session || !currentEmployee) {
      router.replace('/select-project');
    }
  }, [currentProject, session, currentEmployee]);

  const { t } = useLanguage();

  // Fetch completed forms, hauling requests, and injury reports
  useFocusEffect(
    useCallback(() => {
      if (currentProject?.id && currentEmployee?.id) {
        fetchCompletedForms();
        fetchHaulingRequests();
        fetchInjuryReports();
      }
    }, [currentProject?.id, currentEmployee?.id])
  );

  const fetchCompletedForms = async () => {
    if (!currentProject?.id || !currentEmployee?.id) {
      console.log('Missing project or employee ID');
      return;
    }

    try {
      console.log('Fetching completed forms...');
      
      // Fetch PTP forms
      const { data: ptpData, error: ptpError } = await supabase
        .from('submitted_ptp')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (ptpError) {
        console.error('Error fetching PTP forms:', ptpError);
      }

      // Fetch time cards
      const { data: timeCardData, error: timeCardError } = await supabase
        .from('time_cards')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (timeCardError) {
        console.error('Error fetching time cards:', timeCardError);
      }

      // Fetch activity logs
      const { data: activityLogData, error: activityLogError } = await supabase
        .from('daily_activity_logs')
        .select('id, submitted_time, updated_at, revision')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (activityLogError) {
        console.error('Error fetching activity logs:', activityLogError);
      }

      // Combine and format all forms
      const allForms: CompletedForm[] = [
        ...(ptpData || []).map(form => ({
          ...form,
          type: 'ptp' as const,
          display_time: formatSubmittedDate(form.submitted_time),
        })),
        ...(timeCardData || []).map(form => ({
          ...form,
          type: 'timecard' as const,
          display_time: formatSubmittedDate(form.submitted_time),
        })),
        ...(activityLogData || []).map(form => ({
          ...form,
          type: 'activitylog' as const,
          display_time: formatSubmittedDate(form.submitted_time),
        })),
      ];

      // Sort by submitted_time descending
      allForms.sort((a, b) => 
        new Date(b.submitted_time).getTime() - new Date(a.submitted_time).getTime()
      );

      console.log('Completed forms loaded:', allForms.length);
      setCompletedForms(allForms);
    } catch (error) {
      console.error('Error fetching completed forms:', error);
    }
  };

  const fetchHaulingRequests = async () => {
    if (!currentProject?.id) {
      console.log('Missing project ID for hauling requests');
      return;
    }

    try {
      console.log('Fetching hauling requests...');
      
      const { data, error } = await supabase
        .from('hauling_requests')
        .select('id, submitted_time, status')
        .eq('project_id', currentProject.id)
        .order('submitted_time', { ascending: false });

      if (error) {
        console.error('Error fetching hauling requests:', error);
        return;
      }

      console.log('Hauling requests loaded:', data?.length || 0);
      setHaulingRequests(data || []);
    } catch (error) {
      console.error('Error fetching hauling requests:', error);
    }
  };

  const fetchInjuryReports = async () => {
    if (!currentProject?.id) {
      console.log('Missing project ID for injury reports');
      return;
    }
    
    try {
      console.log('Fetching injury reports...');
      
      const { data, error } = await supabase
        .from('injury_reports')
        .select('id, reported_at, created_at, updated_at, status')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('reported_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching injury reports:', error);
        return;
      }

      console.log('Injury reports loaded:', data?.length || 0);
      setInjuryReports(data || []);
    } catch (error) {
      console.error('Error fetching injury reports:', error);
    }
  };

  // Update the safetyForms array to change INCIDENT to REPORT AN INJURY
  const manageJobSiteForms: FormCard[] = [
    { id: 'extra-work-tickets', titleKey: 'EXTRA WORK TICKETS' },
    { id: 'hauling-dumpsters', titleKey: 'HAULING DUMPSTERS' },
  ];

  const safetyForms: FormCard[] = [
    { id: 'equipment-inspection', titleKey: 'EQUIPMENT INSPECTION' },
    { id: 'observation', titleKey: 'OBSERVATION' },
    { id: 'near-miss', titleKey: 'NEAR MISS' },
    { id: 'incident', titleKey: 'REPORT AN INJURY' }, // Changed from 'INCIDENT'
  ];

  const formatSubmittedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusLabel = (status: 'pending' | 'sent' | 'failed' | string): string => {
    if (status === 'pending') return 'Pending';
    if (status === 'sent') return 'Sent';
    if (status === 'failed') return 'Failed';
    // For injury reports, capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: 'pending' | 'sent' | 'failed' | string): string => {
    if (status === 'pending') return '#FF9500';
    if (status === 'sent') return '#34C759';
    if (status === 'failed') return '#FF3B30';
    // For injury reports with "Submitted" status
    if (status === 'submitted') return '#34C759';
    return '#007AFF'; // Default blue for other statuses
  };

  const formatInjuryReportDate = (report: InjuryReport): string => {
    const dateToUse = report.reported_at || report.created_at;
    return formatSubmittedDate(dateToUse);
  };

  const handleFormPress = (formTitle: string, formId: string, tabType: TabType) => {
    console.log('Form pressed:', formTitle, formId, tabType);
    
    if (tabType === 'moreForms') {
      // Handle More Forms tab navigation
      if (formId === 'extra-work-tickets') {
        router.push('/extra-work-ticket-1');
      } else if (formId === 'hauling-dumpsters') {
        router.push('/hauling-dumpsters-0');
      } else if (formId === 'equipment-inspection') {
        router.push('/equipment-inspection-1');
      } else if (formId === 'observation') {
        router.push('/observation-report-1');
      } else if (formId === 'near-miss') {
        router.push('/near-miss-report-1');
      } else if (formId === 'incident') {
        router.push('/incident-report-1');
      }
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
    console.log('Edit time card pressed:', formId);
    router.push({
      pathname: '/time-cards-1',
      params: { mode: 'edit', editingId: formId },
    });
  };

  const handleEditActivityLogPress = (formId: string) => {
    console.log('Edit activity log pressed:', formId);
    router.push({
      pathname: '/daily-activity-log-1',
      params: { mode: 'edit', editingId: formId },
    });
  };

  const handleLogout = () => {
    console.log('Logging out...');
    router.replace('/login');
  };

  const handleNavigateToProfile = () => {
    router.push('/profile');
  };

  const handleNavigateToSelectProject = () => {
    router.push('/select-project');
  };

  const handleDuplicateYesterday = () => {
    router.push({
      pathname: '/pre-task-select-tasks',
      params: { mode: 'duplicate' },
    });
  };

  const handleStartNew = () => {
    router.push('/pre-task-select-tasks');
  };

  const handleOpenProjectInfo = () => {
    router.push('/project-info-modal');
  };

  const projectName = currentProject?.name || 'Project';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.projectName} numberOfLines={1} ellipsizeMode="tail">
              {projectName}
            </Text>
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
            onPress={handleNavigateToProfile}
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
          style={[styles.tab, activeTab === 'todo' && styles.tabActive]}
          onPress={() => setActiveTab('todo')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'todo' && styles.tabTextActive,
            ]}
          >
            TO-DO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'moreForms' && styles.tabActive]}
          onPress={() => setActiveTab('moreForms')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'moreForms' && styles.tabTextActive,
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
        {activeTab === 'todo' ? (
          <View>
            <Text style={styles.sectionTitle}>TODAY</Text>
            
            <TouchableOpacity
              style={styles.formCard}
              onPress={handleStartNew}
              activeOpacity={0.7}
            >
              <Text style={styles.formTitle}>DAILY PRE-TASK CHECKLIST</Text>
              <View style={styles.addIconContainer}>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formCard}
              onPress={() => router.push('/time-cards-1')}
              activeOpacity={0.7}
            >
              <Text style={styles.formTitle}>TIME-CARDS</Text>
              <View style={styles.addIconContainer}>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formCard}
              onPress={() => router.push('/daily-activity-log-1')}
              activeOpacity={0.7}
            >
              <Text style={styles.formTitle}>DAILY ACTIVITY LOG</Text>
              <View style={styles.addIconContainer}>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
              Completed Forms
            </Text>
            
            {completedForms.length === 0 ? (
              <Text style={styles.emptyText}>No completed forms yet</Text>
            ) : (
              <React.Fragment>
                {completedForms.map((form, index) => (
                  <View key={index} style={styles.completedCard}>
                    <View style={styles.completedCardContent}>
                      <Text style={styles.completedFormTitle}>
                        {form.type === 'ptp' && 'Daily Pre-Task Checklist'}
                        {form.type === 'timecard' && 'Time-Cards'}
                        {form.type === 'activitylog' && 'Daily Activity Log'}
                      </Text>
                      <Text style={styles.submittedDate}>
                        Submitted on: {form.display_time}
                      </Text>
                    </View>
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
              </React.Fragment>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Manage Job-Site</Text>
            {manageJobSiteForms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={styles.formCard}
                onPress={() => handleFormPress(form.titleKey, form.id, 'moreForms')}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{form.titleKey}</Text>
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
                onPress={() => handleFormPress(form.titleKey, form.id, 'moreForms')}
                activeOpacity={0.7}
              >
                <Text style={styles.formTitle}>{form.titleKey}</Text>
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
            
            {/* Hauling Dumpsters - existing implementation */}
            {haulingRequests.map((request, index) => (
              <View key={index} style={styles.completedFormCard}>
                <View style={styles.completedFormHeader}>
                  <Text style={styles.completedFormTitle}>Hauling Dumpsters</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  >
                    <Text style={styles.statusPillText}>
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.completedFormSubtitle}>
                  Submitted on: {formatSubmittedDate(request.submitted_time)}
                </Text>
              </View>
            ))}

            {/* Injury Reports - new implementation */}
            {injuryReports.map((report, index) => (
              <View key={index} style={styles.completedFormCard}>
                <View style={styles.completedFormHeader}>
                  <Text style={styles.completedFormTitle}>Report an Injury</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: getStatusColor(report.status) },
                    ]}
                  >
                    <Text style={styles.statusPillText}>
                      {getStatusLabel(report.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.completedFormSubtitle}>
                  Submitted on: {formatInjuryReportDate(report)}
                </Text>
              </View>
            ))}

            {haulingRequests.length === 0 && injuryReports.length === 0 && (
              <Text style={styles.emptyText}>No completed forms yet</Text>
            )}
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
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
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
  completedFormCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  completedFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedFormSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
});
