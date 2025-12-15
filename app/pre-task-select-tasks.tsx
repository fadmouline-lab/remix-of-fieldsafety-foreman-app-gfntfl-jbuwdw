
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const availableTasks = [
  'Demolition',
  'Scaffolding Setup',
  'Electrical Work',
  'Plumbing',
  'Concrete Pouring',
  'Framing',
  'Drywall Installation',
  'Painting',
  'Roofing',
  'HVAC Installation',
  'Excavation',
  'Welding',
];

export default function PreTaskSelectTasksScreen() {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleTask = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleNext = () => {
    console.log('Selected tasks:', selectedTasks);
    router.push({
      pathname: '/pre-task-select-workers',
      params: { tasks: JSON.stringify(selectedTasks) },
    });
  };

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>Select today&apos;s tasks.</Text>

        <View style={styles.taskGrid}>
          {availableTasks.map((task, index) => {
            const isSelected = selectedTasks.includes(task);
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
                >
                  {task}
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
            NEXT
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
    minHeight: 80,
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
