
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PreTaskCard {
  id: string;
  task_name: string;
  hazards: string[];
  mitigation: string[];
}

export default function PreTaskSelectTasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentProject, lastSubmittedPtpId } = useAuth();
  
  const [tasks, setTasks] = useState<PreTaskCard[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<PreTaskCard[]>([]);
  const [loading, setLoading] = useState(true);

  const mode = (params.mode as string) || 'CREATE';
  const editingId = params.editingId as string | undefined;

  useEffect(() => {
    loadTasks();
  }, [currentProject]);

  const loadTasks = async () => {
    if (!currentProject) {
      console.log('No current project selected');
      Alert.alert('Error', 'No project selected. Please select a project first.');
      setLoading(false);
      return;
    }

    console.log('Loading tasks for project:', currentProject.id);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pre_task_cards')
        .select('id, task_name, hazards, mitigation')
        .eq('project_id', currentProject.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching tasks:', error);
        Alert.alert('Error', 'Failed to load tasks. Please try again.');
        setTasks([]);
      } else {
        console.log('Tasks loaded:', data?.length || 0);
        setTasks(data || []);
        
        // If in DUPLICATE or EDIT mode, preload selected tasks
        if ((mode === 'DUPLICATE' || mode === 'EDIT') && data) {
          await preloadSelectedTasks(data);
        }
      }
    } catch (error) {
      console.error('Exception loading tasks:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const preloadSelectedTasks = async (availableTasks: PreTaskCard[]) => {
    const sourceId = mode === 'EDIT' ? editingId : lastSubmittedPtpId;
    
    if (!sourceId) {
      console.log('No source ID for preloading tasks');
      return;
    }

    console.log(`Preloading tasks from ${mode} mode, source ID:`, sourceId);

    try {
      const { data, error } = await supabase
        .from('submitted_ptp_tasks')
        .select('pre_task_card_id')
        .eq('submitted_ptp_id', sourceId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching previous tasks:', error);
        return;
      }

      if (data && data.length > 0) {
        const preTaskCardIds = data.map((t) => t.pre_task_card_id);
        const preselected = availableTasks.filter((task) =>
          preTaskCardIds.includes(task.id)
        );
        console.log('Preselected tasks:', preselected.length);
        setSelectedTasks(preselected);
      }
    } catch (error) {
      console.error('Exception preloading tasks:', error);
    }
  };

  const toggleTask = (task: PreTaskCard) => {
    const isSelected = selectedTasks.some((t) => t.id === task.id);
    if (isSelected) {
      setSelectedTasks(selectedTasks.filter((t) => t.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleNext = () => {
    console.log('Selected tasks:', selectedTasks.length);
    router.push({
      pathname: '/pre-task-select-workers',
      params: {
        tasks: JSON.stringify(selectedTasks),
        mode,
        editingId: editingId || '',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pre-Task Card – Tasks</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pre-Task Card – Tasks</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No tasks available for this project.</Text>
          <Text style={styles.emptySubtext}>
            Please contact your manager to add tasks.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Pre-Task Card – Tasks
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
        <Text style={styles.instruction}>Select today&apos;s tasks.</Text>

        <View style={styles.taskGrid}>
          {tasks.map((task, index) => {
            const isSelected = selectedTasks.some((t) => t.id === task.id);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.taskBox,
                  isSelected && styles.taskBoxSelected,
                ]}
                onPress={() => toggleTask(task)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.taskText,
                    isSelected && styles.taskTextSelected,
                  ]}
                  numberOfLines={3}
                >
                  {task.task_name}
                </Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedTasks.length === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedTasks.length === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.nextButtonText,
              selectedTasks.length === 0 && styles.nextButtonTextDisabled,
            ]}
          >
            NEXT ({selectedTasks.length} selected)
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  taskBox: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  taskBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  taskTextSelected: {
    color: colors.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.highlight,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
  nextButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
