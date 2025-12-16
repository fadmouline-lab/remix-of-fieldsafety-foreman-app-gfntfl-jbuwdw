
import React from 'react';
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

interface Worker {
  name: string;
  hours: number;
  ptpSigned: boolean;
}

export default function TimeCardsPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const workers: Worker[] = params.workers
    ? JSON.parse(params.workers as string)
    : [];

  const handleSubmit = () => {
    console.log('Submitting Time Cards...');
    console.log('Workers:', workers);
    
    // Navigate back to Dashboard
    // Using multiple back() calls to return to the home screen
    router.back();
    router.back();
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
        <Text style={styles.headerTitle}>Time Cards – Review</Text>
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
            <Text style={styles.preparedByValue}>John Smith</Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Hours</Text>
          <Text style={styles.totalValue}>
            {workers.reduce((sum, worker) => sum + worker.hours, 0).toFixed(1)} hrs
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT TIME CARDS</Text>
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
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
