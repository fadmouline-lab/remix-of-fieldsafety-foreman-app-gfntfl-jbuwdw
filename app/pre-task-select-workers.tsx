
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const availableWorkers = [
  'Juan Perez',
  'Maria Garcia',
  'Carlos Rodriguez',
  'Ana Martinez',
  'Luis Hernandez',
  'Sofia Lopez',
  'Miguel Torres',
  'Elena Ramirez',
  'Diego Sanchez',
  'Isabella Flores',
];

export default function PreTaskSelectWorkersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];

  const toggleWorker = (worker: string) => {
    if (selectedWorkers.includes(worker)) {
      setSelectedWorkers(selectedWorkers.filter((w) => w !== worker));
    } else {
      setSelectedWorkers([...selectedWorkers, worker]);
    }
  };

  const handleNext = () => {
    console.log('Selected workers:', selectedWorkers);
    router.push({
      pathname: '/pre-task-summary',
      params: {
        tasks: JSON.stringify(tasks),
        workers: JSON.stringify(selectedWorkers),
      },
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
        <Text style={styles.headerTitle}>Pre-Task Card – Workers</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>Select workers for today.</Text>

        <View style={styles.workerList}>
          {availableWorkers.map((worker, index) => {
            const isSelected = selectedWorkers.includes(worker);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.workerBox,
                  isSelected && styles.workerBoxSelected,
                ]}
                onPress={() => toggleWorker(worker)}
                activeOpacity={0.7}
              >
                <View style={styles.workerContent}>
                  <View style={styles.workerIcon}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={24}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.workerText,
                      isSelected && styles.workerTextSelected,
                    ]}
                  >
                    {worker}
                  </Text>
                </View>
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
            selectedWorkers.length === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedWorkers.length === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.nextButtonText,
              selectedWorkers.length === 0 && styles.nextButtonTextDisabled,
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
  workerList: {
    gap: 12,
  },
  workerBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  workerBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  workerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workerTextSelected: {
    color: colors.primary,
  },
  checkIcon: {
    marginLeft: 12,
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
