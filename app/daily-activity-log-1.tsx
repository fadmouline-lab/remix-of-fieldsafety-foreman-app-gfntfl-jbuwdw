
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface QuestionState {
  value: boolean;
  description: string;
}

export default function DailyActivityLogPage1() {
  const router = useRouter();
  const [nearMiss, setNearMiss] = useState<QuestionState>({ value: false, description: '' });
  const [incident, setIncident] = useState<QuestionState>({ value: false, description: '' });
  const [observation, setObservation] = useState<QuestionState>({ value: false, description: '' });

  const handleNearMissToggle = (value: boolean) => {
    setNearMiss({ value, description: value ? nearMiss.description : '' });
  };

  const handleIncidentToggle = (value: boolean) => {
    setIncident({ value, description: value ? incident.description : '' });
  };

  const handleObservationToggle = (value: boolean) => {
    setObservation({ value, description: value ? observation.description : '' });
  };

  const handleNext = () => {
    console.log('Near Miss:', nearMiss);
    console.log('Incident:', incident);
    console.log('Observation:', observation);
    router.push({
      pathname: '/daily-activity-log-2',
      params: {
        nearMiss: JSON.stringify(nearMiss),
        incident: JSON.stringify(incident),
        observation: JSON.stringify(observation),
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
        <Text style={styles.headerTitle}>Daily Activity Log</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Near Miss Question */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>Any Near Misses?</Text>
            <Switch
              value={nearMiss.value}
              onValueChange={handleNearMissToggle}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          {nearMiss.value && (
            <View style={styles.expandedContent}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe what happened…"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={nearMiss.description}
                onChangeText={(text) => setNearMiss({ ...nearMiss, description: text })}
                textAlignVertical="top"
              />
              <View style={styles.helperBox}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.helperText}>Please fill out Near Miss form.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Incident Question */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>Any Incidents?</Text>
            <Switch
              value={incident.value}
              onValueChange={handleIncidentToggle}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          {incident.value && (
            <View style={styles.expandedContent}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe what happened…"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={incident.description}
                onChangeText={(text) => setIncident({ ...incident, description: text })}
                textAlignVertical="top"
              />
              <View style={styles.helperBox}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.helperText}>Please fill out Incident form.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Observation Question */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>Any Observations?</Text>
            <Switch
              value={observation.value}
              onValueChange={handleObservationToggle}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          {observation.value && (
            <View style={styles.expandedContent}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe what happened…"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={observation.description}
                onChangeText={(text) => setObservation({ ...observation, description: text })}
                textAlignVertical="top"
              />
              <View style={styles.helperBox}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.helperText}>Please fill out Observation form.</Text>
              </View>
            </View>
          )}
        </View>
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
    fontSize: 20,
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
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
    gap: 12,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  helperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  helperText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
