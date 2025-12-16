
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ObservationReportSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const observer = params.observer as string;
  const observationDate = params.observationDate ? new Date(params.observationDate as string) : new Date();
  const observationTime = params.observationTime ? new Date(params.observationTime as string) : new Date();
  const location = params.location as string;
  const area = params.area as string;
  const observationDescription = params.observationDescription as string;
  const photos = params.photos ? JSON.parse(params.photos as string) : [];
  const correctiveActionTaken = params.correctiveActionTaken === 'true';
  const correctiveActionDescription = params.correctiveActionDescription as string;
  const areaSafe = params.areaSafe === 'true';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    console.log('Submitting Observation Report');
    console.log('Observer:', observer);
    console.log('Photos:', photos.length);

    // Navigate back to Dashboard
    router.push('/(tabs)/(home)');
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
        <Text style={styles.headerTitle}>Observation – Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <View style={styles.tableCard}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Observer</Text>
              <Text style={styles.tableValue}>{observer}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Date</Text>
              <Text style={styles.tableValue}>{formatDate(observationDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Time</Text>
              <Text style={styles.tableValue}>{formatTime(observationTime)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Location</Text>
              <Text style={[styles.tableValue, styles.locationValue]}>{location}</Text>
            </View>
            {area && (
              <View style={[styles.tableRow, styles.lastRow]}>
                <Text style={styles.tableLabel}>Area</Text>
                <Text style={styles.tableValue}>{area}</Text>
              </View>
            )}
            {!area && <View style={styles.lastRow} />}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.tableCard}>
            <View style={styles.descriptionRow}>
              <Text style={styles.tableLabel}>Observation description</Text>
              <Text style={styles.descriptionText}>{observationDescription || 'N/A'}</Text>
            </View>
            {correctiveActionTaken && (
              <View style={styles.descriptionRow}>
                <Text style={styles.tableLabel}>Corrective action</Text>
                <Text style={styles.descriptionText}>{correctiveActionDescription || 'N/A'}</Text>
              </View>
            )}
            <View style={[styles.tableRow, styles.lastRow]}>
              <Text style={styles.tableLabel}>Area safe?</Text>
              <Text style={[styles.tableValue, areaSafe ? styles.safeText : styles.unsafeText]}>
                {areaSafe ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </View>

        {/* Photos Section */}
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosContainer}>
              {photos.map((photo: string, index: number) => (
                <View key={index} style={styles.photoThumbnail}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prepared By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prepared By</Text>
          <View style={styles.tableCard}>
            <View style={[styles.tableRow, styles.lastRow]}>
              <Text style={styles.tableLabel}>Current User</Text>
              <Text style={styles.tableValue}>{observer}</Text>
            </View>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tableCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  descriptionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  locationValue: {
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  safeText: {
    color: colors.success,
  },
  unsafeText: {
    color: colors.secondary,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: '100%',
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
