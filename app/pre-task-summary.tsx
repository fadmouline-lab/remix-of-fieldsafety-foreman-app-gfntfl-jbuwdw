
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

const summaryData = {
  dateCreated: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  supervisor: 'John Smith',
  jobLocation: 'UIC Project Site - Building A',
  nearestHospital: 'Rush University Medical Center',
  hospitalAddress: '1653 W Congress Pkwy, Chicago, IL 60612',
  hospitalNumber: '(312) 942-5000',
  weather: 'Partly Cloudy, 45°F',
};

const taskRisksData: { [key: string]: { risks: string; mitigations: string } } = {
  'Demolition': {
    risks: 'Falling debris, dust exposure',
    mitigations: 'Hard hats required, dust masks, safety barriers',
  },
  'Scaffolding Setup': {
    risks: 'Falls from height, structural collapse',
    mitigations: 'Fall protection harnesses, inspect scaffolding, trained personnel only',
  },
  'Electrical Work': {
    risks: 'Electric shock, arc flash',
    mitigations: 'Lockout/tagout procedures, insulated tools, qualified electricians',
  },
  'Plumbing': {
    risks: 'Water damage, slip hazards',
    mitigations: 'Proper drainage, non-slip footwear, water shutoff procedures',
  },
  'Concrete Pouring': {
    risks: 'Chemical burns, heavy lifting',
    mitigations: 'Protective gloves, proper lifting techniques, team coordination',
  },
  'Framing': {
    risks: 'Cuts, nail gun injuries',
    mitigations: 'Safety glasses, proper tool handling, clear work zones',
  },
  'Drywall Installation': {
    risks: 'Dust inhalation, repetitive strain',
    mitigations: 'Respirators, ergonomic tools, regular breaks',
  },
  'Painting': {
    risks: 'Fume inhalation, falls from ladders',
    mitigations: 'Ventilation, respirators, stable ladder setup',
  },
  'Roofing': {
    risks: 'Falls from height, heat exposure',
    mitigations: 'Fall protection, hydration, sun protection',
  },
  'HVAC Installation': {
    risks: 'Heavy equipment, refrigerant exposure',
    mitigations: 'Proper lifting, ventilation, certified technicians',
  },
  'Excavation': {
    risks: 'Cave-ins, underground utilities',
    mitigations: 'Shoring systems, utility location, competent person on site',
  },
  'Welding': {
    risks: 'Burns, fume inhalation, fire hazards',
    mitigations: 'Welding helmets, ventilation, fire watch, fire extinguishers',
  },
};

export default function PreTaskSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];
  const workers = params.workers ? JSON.parse(params.workers as string) : [];

  const handleSubmit = () => {
    console.log('Submitting pre-task form...');
    console.log('Tasks:', tasks);
    console.log('Workers:', workers);
    router.back();
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
        <Text style={styles.headerTitle}>Pre-Task Card – Summary</Text>
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
            <Text style={styles.value}>{summaryData.dateCreated}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Supervisor</Text>
            <Text style={styles.value}>{summaryData.supervisor}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Job Location</Text>
            <Text style={styles.value}>{summaryData.jobLocation}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nearest Hospital</Text>
            <Text style={styles.value}>{summaryData.nearestHospital}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hospital Address</Text>
            <Text style={styles.value}>{summaryData.hospitalAddress}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hospital Number</Text>
            <Text style={styles.value}>{summaryData.hospitalNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Weather</Text>
            <Text style={styles.value}>{summaryData.weather}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Workers</Text>
            <Text style={styles.value}>{workers.join(', ')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Prepared by</Text>
            <Text style={styles.value}>John Smith</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks</Text>

        {tasks.map((task: string, index: number) => {
          const taskData = taskRisksData[task] || {
            risks: 'Standard workplace hazards',
            mitigations: 'Follow safety protocols, use PPE',
          };
          return (
            <View key={index} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{task}</Text>
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskLabel}>Risks:</Text>
                <Text style={styles.taskText}>{taskData.risks}</Text>
                <Text style={[styles.taskLabel, styles.taskLabelMargin]}>
                  Mitigations:
                </Text>
                <Text style={styles.taskText}>{taskData.mitigations}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT FORM</Text>
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
  },
  taskLabelMargin: {
    marginTop: 8,
  },
  taskText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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
