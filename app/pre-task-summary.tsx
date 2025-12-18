
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PreTaskCard {
  id: string;
  task_name: string;
  hazards: string[];
  mitigation: string[];
}

interface SelectedWorker {
  employee_id: string;
  full_name: string;
}

export default function PreTaskSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject, checkForPreviousPtp } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const tasks: PreTaskCard[] = params.tasks ? JSON.parse(params.tasks as string) : [];
  const workers: SelectedWorker[] = params.workers ? JSON.parse(params.workers as string) : [];
  const mode = (params.mode as string) || 'CREATE';
  const editingId = params.editingId as string | undefined;

  const dateCreated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userName = currentEmployee
    ? `${currentEmployee.first_name} ${currentEmployee.last_name}`
    : 'Unknown User';

  const jobLocation = currentProject?.location || 'Unknown Location';

  const handleSubmit = async () => {
    if (!currentEmployee || !currentProject) {
      Alert.alert('Error', 'Missing employee or project data. Please try again.');
      return;
    }

    if (tasks.length === 0) {
      Alert.alert('Error', 'No tasks selected. Please go back and select tasks.');
      return;
    }

    if (workers.length === 0) {
      Alert.alert('Error', 'No workers selected. Please go back and select workers.');
      return;
    }

    console.log(`Submitting PTP form in ${mode} mode...`);
    setSubmitting(true);

    try {
      if (mode === 'EDIT' && editingId) {
        // EDIT MODE: Update existing submission
        await handleEditSubmit(editingId);
      } else {
        // CREATE or DUPLICATE MODE: Create new submission
        await handleCreateSubmit();
      }
    } catch (error) {
      console.error('Exception during submission:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!currentEmployee || !currentProject) return;

    // Step 1: Insert into submitted_ptp
    const { data: submittedPtp, error: ptpError } = await supabase
      .from('submitted_ptp')
      .insert({
        org_id: currentEmployee.org_id,
        project_id: currentProject.id,
        submitted_by_employee_id: currentEmployee.id,
        date_created: new Date().toISOString().split('T')[0],
        submitted_time: new Date().toISOString(),
        job_location: jobLocation,
        revision: 1,
      })
      .select('id')
      .single();

    if (ptpError) {
      console.error('Error inserting into submitted_ptp:', ptpError);
      Alert.alert('Submission Error', 'Failed to submit form. Please try again.');
      setSubmitting(false);
      return;
    }

    const submittedPtpId = submittedPtp.id;
    console.log('Submitted PTP ID:', submittedPtpId);

    // Step 2: Insert tasks into submitted_ptp_tasks
    const taskInserts = tasks.map((task, index) => ({
      submitted_ptp_id: submittedPtpId,
      pre_task_card_id: task.id,
      sort_order: index,
    }));

    const { error: tasksError } = await supabase
      .from('submitted_ptp_tasks')
      .insert(taskInserts);

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
      Alert.alert('Submission Error', 'Failed to save tasks. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Tasks inserted:', taskInserts.length);

    // Step 3: Insert workers into submitted_ptp_workers
    const workerInserts = workers.map((worker) => ({
      submitted_ptp_id: submittedPtpId,
      employee_id: worker.employee_id,
    }));

    const { error: workersError } = await supabase
      .from('submitted_ptp_workers')
      .insert(workerInserts);

    if (workersError) {
      console.error('Error inserting workers:', workersError);
      Alert.alert('Submission Error', 'Failed to save workers. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Workers inserted:', workerInserts.length);

    // Success! Update the previous PTP check
    await checkForPreviousPtp();

    setSubmitting(false);
    
    // Navigate back to Dashboard
    Alert.alert(
      'Success',
      'Pre-Task Checklist submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            router.dismissAll();
            router.replace('/(tabs)/(home)');
          },
        },
      ]
    );
  };

  const handleEditSubmit = async (submittedPtpId: string) => {
    if (!currentEmployee) return;

    // Step 1: Update submitted_ptp
    const { error: updateError } = await supabase
      .from('submitted_ptp')
      .update({
        updated_by_employee_id: currentEmployee.id,
        revision: supabase.sql`revision + 1`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submittedPtpId);

    if (updateError) {
      console.error('Error updating submitted_ptp:', updateError);
      Alert.alert('Update Error', 'Failed to update form. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Updated PTP ID:', submittedPtpId);

    // Step 2: Delete existing tasks
    const { error: deleteTasksError } = await supabase
      .from('submitted_ptp_tasks')
      .delete()
      .eq('submitted_ptp_id', submittedPtpId);

    if (deleteTasksError) {
      console.error('Error deleting tasks:', deleteTasksError);
      Alert.alert('Update Error', 'Failed to update tasks. Please try again.');
      setSubmitting(false);
      return;
    }

    // Step 3: Insert new tasks
    const taskInserts = tasks.map((task, index) => ({
      submitted_ptp_id: submittedPtpId,
      pre_task_card_id: task.id,
      sort_order: index,
    }));

    const { error: tasksError } = await supabase
      .from('submitted_ptp_tasks')
      .insert(taskInserts);

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
      Alert.alert('Update Error', 'Failed to save tasks. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Tasks updated:', taskInserts.length);

    // Step 4: Delete existing workers
    const { error: deleteWorkersError } = await supabase
      .from('submitted_ptp_workers')
      .delete()
      .eq('submitted_ptp_id', submittedPtpId);

    if (deleteWorkersError) {
      console.error('Error deleting workers:', deleteWorkersError);
      Alert.alert('Update Error', 'Failed to update workers. Please try again.');
      setSubmitting(false);
      return;
    }

    // Step 5: Insert new workers
    const workerInserts = workers.map((worker) => ({
      submitted_ptp_id: submittedPtpId,
      employee_id: worker.employee_id,
    }));

    const { error: workersError } = await supabase
      .from('submitted_ptp_workers')
      .insert(workerInserts);

    if (workersError) {
      console.error('Error inserting workers:', workersError);
      Alert.alert('Update Error', 'Failed to save workers. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Workers updated:', workerInserts.length);

    // Success!
    setSubmitting(false);
    
    // Navigate back to Dashboard
    Alert.alert(
      'Success',
      'Pre-Task Checklist updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            router.dismissAll();
            router.replace('/(tabs)/(home)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={submitting}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={submitting ? colors.textSecondary : colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Pre-Task Card – Summary
          {mode === 'EDIT' && ' (Edit)'}
          {mode === 'DUPLICATE' && ' (Duplicate)'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Date Created</Text>
            <Text style={styles.value}>{dateCreated}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>User</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Job Location</Text>
            <Text style={styles.value}>{jobLocation}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nearest Hospital</Text>
            <Text style={styles.value}>To be determined</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hospital Address</Text>
            <Text style={styles.value}>To be determined</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hospital Phone</Text>
            <Text style={styles.value}>To be determined</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Weather</Text>
            <Text style={styles.value}>To be determined</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Workers</Text>
            <Text style={styles.value}>
              {workers.map((w) => w.full_name).join(', ')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks</Text>

        {tasks.map((task, index) => (
          <React.Fragment key={index}>
            <View style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{task.task_name}</Text>
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskLabel}>Risks:</Text>
                {task.hazards && task.hazards.length > 0 ? (
                  task.hazards.map((hazard, hIndex) => (
                    <Text key={hIndex} style={styles.taskBullet}>
                      - {hazard}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.taskText}>No hazards listed</Text>
                )}

                <Text style={[styles.taskLabel, styles.taskLabelMargin]}>
                  Mitigations:
                </Text>
                {task.mitigation && task.mitigation.length > 0 ? (
                  task.mitigation.map((mitigation, mIndex) => (
                    <Text key={mIndex} style={styles.taskBullet}>
                      - {mitigation}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.taskText}>No mitigations listed</Text>
                )}
              </View>
            </View>
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <React.Fragment>
              <ActivityIndicator size="small" color={colors.card} />
              <Text style={styles.submitButtonText}>
                {mode === 'EDIT' ? 'UPDATING...' : 'SUBMITTING...'}
              </Text>
            </React.Fragment>
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'EDIT' ? 'UPDATE FORM' : 'SUBMIT FORM'}
            </Text>
          )}
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
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  taskHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  taskDetails: {
    gap: 4,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  taskLabelMargin: {
    marginTop: 12,
  },
  taskText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  taskBullet: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 8,
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
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  submitButtonDisabled: {
    backgroundColor: colors.highlight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
