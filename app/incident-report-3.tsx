
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

const bodyParts = [
  'Head',
  'Eye',
  'Face',
  'Neck',
  'Shoulder',
  'Arm',
  'Elbow',
  'Hand',
  'Finger',
  'Chest',
  'Back',
  'Abdomen',
  'Hip',
  'Leg',
  'Knee',
  'Ankle',
  'Foot',
  'Toe',
];

const objectSubstances = [
  'Tool',
  'Machine',
  'Material',
  'Debris',
  'Chemical',
  'Other',
];

export default function IncidentReportInjuryDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [showBodyPartPicker, setShowBodyPartPicker] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showObjectPicker, setShowObjectPicker] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddPhoto = async () => {
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
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    console.log('Navigating to Incident Report - Summary');
    router.push({
      pathname: '/incident-report-4',
      params: {
        ...params,
        bodyPart: selectedBodyPart || '',
        objectSubstance: selectedObject || '',
        photos: JSON.stringify(photos),
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
        <Text style={styles.headerTitle}>Incident Report – Injury Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Body Part Affected */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Body Part Affected *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowBodyPartPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectButtonText, !selectedBodyPart && styles.placeholderText]}>
              {selectedBodyPart || 'Select body part'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="keyboard-arrow-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Object/Substance Involved */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Object/Substance Involved *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowObjectPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectButtonText, !selectedObject && styles.placeholderText]}>
              {selectedObject || 'Select object/substance'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="keyboard-arrow-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Photos */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Photos</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleAddPhoto}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="photo-camera"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.photoButtonText}>Add Photo</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoThumbnail}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() => handleDeletePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
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

      {/* Body Part Picker Modal */}
      <Modal
        visible={showBodyPartPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBodyPartPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBodyPartPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Body Part</Text>
              <TouchableOpacity onPress={() => setShowBodyPartPicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {bodyParts.map((part, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedBodyPart(part);
                    setShowBodyPartPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerOptionText}>{part}</Text>
                  {selectedBodyPart === part && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Object/Substance Picker Modal */}
      <Modal
        visible={showObjectPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowObjectPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowObjectPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Object/Substance</Text>
              <TouchableOpacity onPress={() => setShowObjectPicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {objectSubstances.map((obj, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedObject(obj);
                    setShowObjectPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerOptionText}>{obj}</Text>
                  {selectedObject === obj && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  photoButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
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
    borderRadius: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
});
