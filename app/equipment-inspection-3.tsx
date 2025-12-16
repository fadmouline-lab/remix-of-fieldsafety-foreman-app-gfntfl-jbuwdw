
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

interface ChecklistItem {
  id: number;
  question: string;
  status: boolean;
  issue: string;
  photos: string[];
}

export default function EquipmentInspectionSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const equipment = params.equipment as string;
  const checklist: ChecklistItem[] = params.checklist
    ? JSON.parse(params.checklist as string)
    : [];

  const currentDate = new Date();
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
    console.log('Submitting Equipment Inspection');
    console.log('Equipment:', equipment);
    console.log('Checklist items:', checklist.length);

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
        <Text style={styles.headerTitle}>Equipment Inspection – Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Equipment Selected Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Selected</Text>
          <View style={styles.tableCard}>
            <View style={[styles.tableRow, styles.lastRow]}>
              <Text style={styles.tableLabel}>Name</Text>
              <Text style={styles.tableValue}>{equipment}</Text>
            </View>
          </View>
        </View>

        {/* Inspection Results Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Results</Text>
          <View style={styles.tableCard}>
            {checklist.map((item, index) => (
              <View key={item.id}>
                <View style={styles.resultRow}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultNumber}>{index + 1}.</Text>
                    <Text style={styles.resultQuestion}>{item.question}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    {item.status ? (
                      <View style={styles.successBadge}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={20}
                          color={colors.success}
                        />
                        <Text style={styles.successText}>YES</Text>
                      </View>
                    ) : (
                      <View style={styles.errorBadge}>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color={colors.secondary}
                        />
                        <Text style={styles.errorText}>NO</Text>
                      </View>
                    )}
                  </View>
                </View>

                {!item.status && (
                  <View style={styles.issueDetails}>
                    <Text style={styles.issueLabel}>Issue:</Text>
                    <Text style={styles.issueText}>{item.issue || 'No description provided'}</Text>

                    {item.photos.length > 0 && (
                      <View style={styles.photosContainer}>
                        {item.photos.map((photo, photoIndex) => (
                          <View key={photoIndex} style={styles.photoThumbnail}>
                            <Image source={{ uri: photo }} style={styles.photoImage} />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {index < checklist.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Prepared By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prepared By</Text>
          <View style={styles.tableCard}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Current User</Text>
              <Text style={styles.tableValue}>Juan Perez</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Date</Text>
              <Text style={styles.tableValue}>{formatDate(currentDate)}</Text>
            </View>
            <View style={[styles.tableRow, styles.lastRow]}>
              <Text style={styles.tableLabel}>Time</Text>
              <Text style={styles.tableValue}>{formatTime(currentDate)}</Text>
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
          <Text style={styles.submitButtonText}>SUBMIT INSPECTION</Text>
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
  resultRow: {
    paddingVertical: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  resultQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  statusBadge: {
    marginTop: 8,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  issueDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  issueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
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
