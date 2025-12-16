
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface QuestionState {
  value: boolean;
  description: string;
}

interface VoiceMemo {
  id: string;
  duration: string;
}

export default function DailyActivityLogPage3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const nearMiss: QuestionState = params.nearMiss ? JSON.parse(params.nearMiss as string) : { value: false, description: '' };
  const incident: QuestionState = params.incident ? JSON.parse(params.incident as string) : { value: false, description: '' };
  const observation: QuestionState = params.observation ? JSON.parse(params.observation as string) : { value: false, description: '' };
  const photos: string[] = params.photos ? JSON.parse(params.photos as string) : [];
  const notes: string = (params.notes as string) || '';
  const voiceMemos: VoiceMemo[] = params.voiceMemos ? JSON.parse(params.voiceMemos as string) : [];

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSubmit = () => {
    console.log('Submitting Daily Activity Log...');
    console.log('All data:', {
      nearMiss,
      incident,
      observation,
      photos: photos.length,
      notes,
      voiceMemos: voiceMemos.length,
    });
    
    Alert.alert(
      'Form Submitted',
      'Your Daily Activity Log has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.push('/(tabs)/(home)');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info Card */}
        <View style={styles.headerInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{getCurrentDate()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{getCurrentTime()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User:</Text>
            <Text style={styles.infoValue}>John Smith (Foreman)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Job Location:</Text>
            <Text style={styles.infoValue}>UIC Construction Site, Chicago, IL 60611</Text>
          </View>
        </View>

        {/* Page 1 Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Safety Questions</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Near Misses:</Text>
              <View style={styles.summaryValueContainer}>
                <Text style={[styles.summaryValue, nearMiss.value && styles.summaryValueAlert]}>
                  {nearMiss.value ? 'YES' : 'NO'}
                </Text>
              </View>
            </View>
            {nearMiss.value && nearMiss.description && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{nearMiss.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Incidents:</Text>
              <View style={styles.summaryValueContainer}>
                <Text style={[styles.summaryValue, incident.value && styles.summaryValueAlert]}>
                  {incident.value ? 'YES' : 'NO'}
                </Text>
              </View>
            </View>
            {incident.value && incident.description && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{incident.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Observations:</Text>
              <View style={styles.summaryValueContainer}>
                <Text style={[styles.summaryValue, observation.value && styles.summaryValueAlert]}>
                  {observation.value ? 'YES' : 'NO'}
                </Text>
              </View>
            </View>
            {observation.value && observation.description && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{observation.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Page 2 Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Documentation</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Photos:</Text>
              <Text style={styles.summaryValue}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
            </View>
            {photos.length > 0 && (
              <ScrollView
                horizontal
                style={styles.photoScroll}
                contentContainerStyle={styles.photoScrollContent}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} style={styles.photoThumbnail} />
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Notes:</Text>
            </View>
            {notes ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{notes}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>No notes added</Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voice Memos:</Text>
              <Text style={styles.summaryValue}>{voiceMemos.length} memo{voiceMemos.length !== 1 ? 's' : ''}</Text>
            </View>
            {voiceMemos.length > 0 && (
              <View style={styles.memoList}>
                {voiceMemos.map((memo, index) => (
                  <View key={index} style={styles.memoItem}>
                    <IconSymbol
                      ios_icon_name="waveform"
                      android_material_icon_name="graphic-eq"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.memoInfo}>
                      <Text style={styles.memoLabel}>Voice Memo {index + 1}</Text>
                      <Text style={styles.memoDuration}>{memo.duration}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Prepared By */}
        <View style={styles.preparedByCard}>
          <Text style={styles.preparedByLabel}>Prepared By:</Text>
          <Text style={styles.preparedByValue}>John Smith (Foreman)</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerInfoCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.card,
    flex: 1,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  summaryValueAlert: {
    color: colors.secondary,
  },
  descriptionBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  photoScroll: {
    marginTop: 12,
  },
  photoScrollContent: {
    gap: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.highlight,
  },
  memoList: {
    marginTop: 12,
    gap: 8,
  },
  memoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  memoInfo: {
    flex: 1,
  },
  memoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  memoDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  preparedByCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  preparedByLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  preparedByValue: {
    fontSize: 16,
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
