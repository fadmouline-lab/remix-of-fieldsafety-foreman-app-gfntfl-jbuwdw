
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

export default function ProjectInfoModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentProject, currentEmployee } = useAuth();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectInfo();
  }, []);

  const loadProjectInfo = async () => {
    if (!currentProject || !currentEmployee) {
      console.log('Cannot load project info: missing project or employee');
      setLoading(false);
      return;
    }

    console.log('Loading project information...');
    setLoading(true);

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
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (bucket: string, path: string, documentName: string) => {
    try {
      console.log(`Generating signed URL for ${documentName}...`);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 180);

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

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Project Information</Text>
        <TouchableOpacity
          onPress={() => router.back()}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading project information...</Text>
        </View>
      ) : projectInfo ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
        <View style={styles.loadingContainer}>
          <Text style={styles.infoValueNotAssigned}>
            Failed to load project information
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
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
