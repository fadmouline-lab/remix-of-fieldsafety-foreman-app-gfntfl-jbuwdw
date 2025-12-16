
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

interface Worker {
  name: string;
  hours: number;
  onSite: boolean;
}

const initialWorkers: Worker[] = [
  { name: 'Juan Perez (Foreman)', hours: 0.0, onSite: true },
  { name: 'Maria Lopez', hours: 0.0, onSite: true },
  { name: 'Samir Khan', hours: 0.0, onSite: true },
];

const availableWorkers = [
  'Carlos Rodriguez',
  'Emily Chen',
  'Michael Brown',
  'Sofia Martinez',
  'David Kim',
  'Jessica Taylor',
  'Ahmed Hassan',
  'Lisa Anderson',
];

export default function ExtraWorkTicketLaborScreen() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [showAddWorkers, setShowAddWorkers] = useState(false);

  const handleHoursChange = (name: string, delta: number) => {
    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) => {
        if (worker.name === name) {
          const newHours = Math.max(0, Math.min(12, worker.hours + delta));
          return { ...worker, hours: Math.round(newHours * 2) / 2 };
        }
        return worker;
      })
    );
  };

  const addWorker = (workerName: string) => {
    const newWorker: Worker = {
      name: workerName,
      hours: 0.0,
      onSite: true,
    };
    setWorkers([...workers, newWorker]);
    setShowAddWorkers(false);
  };

  const handleNext = () => {
    console.log('Navigating to Extra Work Ticket - Equipment & Materials with workers:', workers);
    router.push({
      pathname: '/extra-work-ticket-2',
      params: { workers: JSON.stringify(workers) },
    });
  };

  const workerNames = workers.map((w) => w.name);
  const availableToAdd = availableWorkers.filter(
    (name) => !workerNames.includes(name)
  );

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
        <Text style={styles.headerTitle}>Extra Work Ticket – Labor</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {workers.map((worker, index) => (
          <View key={index} style={styles.workerCard}>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.onSiteText}>On site today</Text>
            </View>

            <View style={styles.hoursControl}>
              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => handleHoursChange(worker.name, -0.5)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="minus.circle.fill"
                  android_material_icon_name="remove-circle"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.hoursValue}>{worker.hours.toFixed(1)}</Text>

              <TouchableOpacity
                style={styles.hoursButton}
                onPress={() => handleHoursChange(worker.name, 0.5)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {availableToAdd.length > 0 && (
          <View style={styles.addWorkersSection}>
            <TouchableOpacity
              style={styles.addWorkersButton}
              onPress={() => setShowAddWorkers(!showAddWorkers)}
              activeOpacity={0.7}
            >
              <Text style={styles.addWorkersButtonText}>
                {showAddWorkers ? 'Hide available workers' : 'Add worker'}
              </Text>
              <IconSymbol
                ios_icon_name={showAddWorkers ? 'chevron.up' : 'chevron.down'}
                android_material_icon_name={
                  showAddWorkers ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            {showAddWorkers && (
              <View style={styles.availableWorkersContainer}>
                <Text style={styles.availableWorkersTitle}>
                  Available Workers
                </Text>
                {availableToAdd.map((workerName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.availableWorkerBox}
                    onPress={() => addWorker(workerName)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.availableWorkerName}>{workerName}</Text>
                    <IconSymbol
                      ios_icon_name="plus.circle"
                      android_material_icon_name="add-circle-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
  workerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  onSiteText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  hoursControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hoursButton: {
    padding: 4,
  },
  hoursValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  addWorkersSection: {
    marginTop: 20,
  },
  addWorkersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addWorkersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  availableWorkersContainer: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  availableWorkersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  availableWorkerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  availableWorkerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
