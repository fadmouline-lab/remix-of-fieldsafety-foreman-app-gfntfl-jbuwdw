
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

interface ChecklistItem {
  id: number;
  question: string;
  status: boolean;
  issue: string;
  photos: string[];
}

const checklistQuestions = [
  'Is the equipment operating correctly?',
  'Is the equipment free of visible damage?',
  'Are safety guards in place?',
  'Are fluids at acceptable levels?',
  'Are controls functioning properly?',
];

export default function EquipmentInspectionChecklistScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const equipment = params.equipment as string;

  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    checklistQuestions.map((question, index) => ({
      id: index,
      question,
      status: true,
      issue: '',
      photos: [],
    }))
  );

  const handleToggleStatus = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      )
    );
  };

  const handleIssueChange = (id: number, text: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, issue: text } : item
      )
    );
  };

  const handleAddPhoto = async (id: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log('Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setChecklist(
        checklist.map((item) =>
          item.id === id
            ? { ...item, photos: [...item.photos, result.assets[0].uri] }
            : item
        )
      );
    }
  };

  const handleDeletePhoto = (itemId: number, photoIndex: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === itemId
          ? { ...item, photos: item.photos.filter((_, i) => i !== photoIndex) }
          : item
      )
    );
  };

  const handleNext = () => {
    console.log('Navigating to Equipment Inspection - Summary');
    router.push({
      pathname: '/equipment-inspection-3',
      params: {
        equipment,
        checklist: JSON.stringify(checklist),
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
        <Text style={styles.headerTitle}>Equipment Inspection – Checklist</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.equipmentCard}>
          <Text style={styles.equipmentLabel}>Equipment</Text>
          <Text style={styles.equipmentName}>{equipment}</Text>
        </View>

        {checklist.map((item, index) => (
          <View key={item.id} style={styles.checklistCard}>
            <View style={styles.questionRow}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <Text style={styles.questionText}>{item.question}</Text>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Status</Text>
              <View style={styles.toggleContainer}>
                <Text style={[styles.statusText, !item.status && styles.statusTextActive]}>
                  NO
                </Text>
                <Switch
                  value={item.status}
                  onValueChange={() => handleToggleStatus(item.id)}
                  trackColor={{ false: colors.secondary, true: colors.success }}
                  thumbColor={colors.card}
                />
                <Text style={[styles.statusText, item.status && styles.statusTextActive]}>
                  YES
                </Text>
              </View>
            </View>

            {!item.status && (
              <View style={styles.issueContainer}>
                <Text style={styles.issueLabel}>Describe the issue *</Text>
                <TextInput
                  style={styles.issueInput}
                  value={item.issue}
                  onChangeText={(text) => handleIssueChange(item.id, text)}
                  placeholder="Describe what's wrong..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => handleAddPhoto(item.id)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="camera.fill"
                    android_material_icon_name="photo-camera"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.photoButtonText}>Add Photo</Text>
                </TouchableOpacity>

                {item.photos.length > 0 && (
                  <View style={styles.photosContainer}>
                    {item.photos.map((photo, photoIndex) => (
                      <View key={photoIndex} style={styles.photoThumbnail}>
                        <Image source={{ uri: photo }} style={styles.photoImage} />
                        <TouchableOpacity
                          style={styles.deletePhotoButton}
                          onPress={() => handleDeletePhoto(item.id, photoIndex)}
                          activeOpacity={0.7}
                        >
                          <IconSymbol
                            ios_icon_name="xmark.circle.fill"
                            android_material_icon_name="cancel"
                            size={20}
                            color={colors.secondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
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
  equipmentCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  equipmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
    opacity: 0.8,
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.card,
  },
  checklistCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusTextActive: {
    color: colors.text,
  },
  issueContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  issueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  issueInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.card,
    borderRadius: 10,
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
