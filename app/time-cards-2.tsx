
import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Worker {
  employee_id: string;
  name: string;
  hours: number;
  ptpSigned: boolean;
}

export default function TimeCardsPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee, currentProject } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [originalWorkers, setOriginalWorkers] = useState<Worker[]>([]);

  const workers: Worker[] = params.workers
    ? JSON.parse(params.workers as string)
    : [];
  const todayPtpId = (params.todayPtpId as string) || null;
  const mode = (params.mode as string) || 'CREATE';
  const editingId = params.editingId as string | undefined;

  // Load original workers when in EDIT mode
  useEffect(() => {
    if (mode === 'EDIT' && editingId) {
      loadOriginalWorkers();
    }
  }, [mode, editingId]);

  const loadOriginalWorkers = async () => {
    if (!editingId) return;

    console.log('Loading original workers for comparison...');

    try {
      const { data: workersData, error } = await supabase
        .from('submitted_time_card_workers')
        .select(`
          employee_id,
          hours_worked,
          ptp_signed,
          employees:employee_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('submitted_time_card_id', editingId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching original workers:', error);
        return;
      }

      const transformedWorkers: Worker[] = (workersData || []).map((w: any) => ({
        employee_id: w.employee_id,
        name: `${w.employees.first_name} ${w.employees.last_name}`,
        hours: parseFloat(w.hours_worked),
        ptpSigned: w.ptp_signed,
      }));

      setOriginalWorkers(transformedWorkers);
      console.log('Original workers loaded:', transformedWorkers.length);
    } catch (error) {
      console.error('Exception loading original workers:', error);
    }
  };

  const handleSubmit = async () => {
    if (!currentEmployee || !currentProject) {
      Alert.alert('Error', 'Missing employee or project data. Please try again.');
      return;
    }

    if (workers.length === 0) {
      Alert.alert('Error', 'No workers to submit. Please go back and add workers.');
      return;
    }

    console.log(`Submitting Time Card in ${mode} mode...`);
    setSubmitting(true);

    try {
      if (mode === 'EDIT' && editingId) {
        await handleEditSubmit(editingId);
      } else {
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

    const today = new Date().toISOString().split('T')[0];

    // Step 1: Insert into submitted_time_cards
    const { data: timeCardData, error: timeCardError } = await supabase
      .from('submitted_time_cards')
      .insert({
        org_id: currentEmployee.org_id,
        project_id: currentProject.id,
        submitted_by_employee_id: currentEmployee.id,
        work_date: today,
        submitted_time: new Date().toISOString(),
        source_ptp_id: todayPtpId,
        revision: 1,
      })
      .select('id')
      .single();

    if (timeCardError) {
      console.error('Error inserting time card:', timeCardError);
      Alert.alert('Submission Error', 'Failed to submit time card. Please try again.');
      setSubmitting(false);
      return;
    }

    const timeCardId = timeCardData.id;
    console.log('Submitted Time Card ID:', timeCardId);

    // Step 2: Insert workers into submitted_time_card_workers
    const workerInserts = workers.map((worker) => ({
      submitted_time_card_id: timeCardId,
      employee_id: worker.employee_id,
      hours_worked: worker.hours,
      ptp_signed: worker.ptpSigned,
      is_active: true,
    }));

    const { error: workersError } = await supabase
      .from('submitted_time_card_workers')
      .insert(workerInserts);

    if (workersError) {
      console.error('Error inserting workers:', workersError);
      Alert.alert('Submission Error', 'Failed to save workers. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Workers inserted:', workerInserts.length);

    // Success!
    console.log('Time card submitted successfully! Navigating to dashboard...');
    setSubmitting(false);
    
    // Navigate back to Dashboard immediately
    Alert.alert('Success', 'Time card submitted successfully!', [
      {
        text: 'OK',
        onPress: () => {
          router.dismissAll();
          router.replace('/(tabs)/(home)');
        },
      },
    ]);
  };

  const handleEditSubmit = async (timeCardId: string) => {
    if (!currentEmployee) return;

    console.log('Starting edit submission for Time Card ID:', timeCardId);

    // Step 1: Fetch current revision number
    const { data: currentTimeCard, error: fetchError } = await supabase
      .from('submitted_time_cards')
      .select('revision')
      .eq('id', timeCardId)
      .single();

    if (fetchError || !currentTimeCard) {
      console.error('Error fetching current time card:', fetchError);
      Alert.alert('Update Error', 'Failed to fetch time card data. Please try again.');
      setSubmitting(false);
      return;
    }

    const newRevision = (currentTimeCard.revision || 1) + 1;
    console.log('Current revision:', currentTimeCard.revision, 'New revision:', newRevision);

    // Step 2: Update submitted_time_cards
    const { error: updateError } = await supabase
      .from('submitted_time_cards')
      .update({
        updated_by_employee_id: currentEmployee.id,
        revision: newRevision,
      })
      .eq('id', timeCardId);

    if (updateError) {
      console.error('Error updating time card:', updateError);
      Alert.alert('Update Error', 'Failed to update time card. Please try again.');
      setSubmitting(false);
      return;
    }

    console.log('Updated Time Card ID:', timeCardId, 'with revision:', newRevision);

    // Step 3: Identify removed workers (workers in original but NOT in current selection)
    const removedWorkerIds = originalWorkers
      .filter(
        (originalWorker) =>
          !workers.some((worker) => worker.employee_id === originalWorker.employee_id)
      )
      .map((worker) => worker.employee_id);

    console.log('Removed workers:', removedWorkerIds);

    // Step 4: Deactivate ONLY removed workers
    if (removedWorkerIds.length > 0) {
      const { error: deactivateError } = await supabase
        .from('submitted_time_card_workers')
        .update({ is_active: false })
        .eq('submitted_time_card_id', timeCardId)
        .in('employee_id', removedWorkerIds);

      if (deactivateError) {
        console.error('Error deactivating workers:', deactivateError);
        Alert.alert('Update Error', 'Failed to update workers. Please try again.');
        setSubmitting(false);
        return;
      }

      console.log('Deactivated removed workers:', removedWorkerIds.length);
    }

    // Step 5: Update existing workers and insert new workers
    for (const worker of workers) {
      // Check if worker existed in original list
      const existingWorker = originalWorkers.find(
        (originalWorker) => originalWorker.employee_id === worker.employee_id
      );

      if (existingWorker) {
        // Update existing worker's hours
        console.log(
          `Updating worker ${worker.employee_id} hours from ${existingWorker.hours} to ${worker.hours}`
        );

        const { error: updateWorkerError } = await supabase
          .from('submitted_time_card_workers')
          .update({ hours_worked: worker.hours })
          .eq('submitted_time_card_id', timeCardId)
          .eq('employee_id', worker.employee_id)
          .eq('is_active', true);

        if (updateWorkerError) {
          console.error('Error updating worker hours:', updateWorkerError);
          Alert.alert('Update Error', 'Failed to update worker hours. Please try again.');
          setSubmitting(false);
          return;
        }
      } else {
        // Insert new worker
        console.log(`Inserting new worker ${worker.employee_id}`);

        const { error: insertWorkerError } = await supabase
          .from('submitted_time_card_workers')
          .insert({
            submitted_time_card_id: timeCardId,
            employee_id: worker.employee_id,
            hours_worked: worker.hours,
            ptp_signed: worker.ptpSigned,
            is_active: true,
          });

        if (insertWorkerError) {
          console.error('Error inserting worker:', insertWorkerError);
          Alert.alert('Update Error', 'Failed to add new worker. Please try again.');
          setSubmitting(false);
          return;
        }
      }
    }

    console.log('Workers updated successfully');

    // Success!
    console.log('Time card updated successfully! Navigating to dashboard...');
    setSubmitting(false);
    
    // Navigate back to Dashboard immediately
    Alert.alert('Success', 'Time card updated successfully!', [
      {
        text: 'OK',
        onPress: () => {
          router.dismissAll();
          router.replace('/(tabs)/(home)');
        },
      },
    ]);
  };

  const totalHours = workers.reduce((sum, worker) => sum + worker.hours, 0);
  const preparedBy = currentEmployee
    ? `${currentEmployee.first_name} ${currentEmployee.last_name}`
    : 'Unknown User';

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
          Time Cards – Review {mode === 'EDIT' && '(Edit)'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Confirm today&apos;s hours before submitting.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Worker</Text>
            <Text style={styles.tableHeaderText}>Hours</Text>
          </View>

          {workers.map((worker, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index === workers.length - 1 && styles.tableRowLast,
              ]}
            >
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerHours}>{worker.hours.toFixed(1)} hrs</Text>
            </View>
          ))}

          <View style={styles.preparedByRow}>
            <Text style={styles.preparedByLabel}>Prepared by:</Text>
            <Text style={styles.preparedByValue}>{preparedBy}</Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Hours</Text>
          <Text style={styles.totalValue}>
            {totalHours.toFixed(1)} hrs
          </Text>
        </View>
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
              {mode === 'EDIT' ? 'UPDATE TIME CARDS' : 'SUBMIT TIME CARDS'}
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
  instruction: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workerHours: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  preparedByRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  preparedByLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  preparedByValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.card,
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
