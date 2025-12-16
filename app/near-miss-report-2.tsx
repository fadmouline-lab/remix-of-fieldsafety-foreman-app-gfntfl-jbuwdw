
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Switch,
  Modal,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

const nearMissTypes = [
  'Slip / Trip / Fall',
  'Struck-by',
  'Equipment-related',
  'Electrical',
  'Chemical',
  'Other',
];

export default function NearMissReportDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [nearMissDescription, setNearMissDescription] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [areaSafe, setAreaSafe] = useState(true);

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
    console.log('Navigating to Near Miss Report - Summary');
    router.push({
      pathname: '/near-miss-report-3',
      params: {
        ...params,
        nearMissDescription,
        nearMissType: selectedType || '',
        photos: JSON.stringify(photos),
        correctiveAction,
        areaSafe: areaSafe.toString(),
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
        <Text style={styles.headerTitle}>Near Miss – Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Describe the Near Miss */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Describe the near miss *</Text>
          <Text style={styles.fieldHint}>What almost happened?</Text>
          <TextInput
            style={styles.textArea}
            value={nearMissDescription}
            onChangeText={setNearMissDescription}
            placeholder="Describe what almost happened..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Type of Near Miss */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Type of near miss</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTypePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectButtonText, !selectedType && styles.placeholderText]}>
              {selectedType || 'Select type (optional)'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="keyboard-arrow-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Add Photos */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Add Photos</Text>
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

        {/* Immediate Corrective Action */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Immediate corrective action taken *</Text>
          <TextInput
            style={styles.textArea}
            value={correctiveAction}
            onChangeText={setCorrectiveAction}
            placeholder="Describe the corrective action taken..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Area Safe Toggle */}
        <View style={styles.fieldContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Is the area now safe?</Text>
            <Switch
              value={areaSafe}
              onValueChange={setAreaSafe}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.card}
            />
          </View>
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

      {/* Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Near Miss Type</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {nearMissTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypePicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerOptionText}>{type}</Text>
                  {selectedType === type && (
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
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
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
  toggleRow: {
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
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
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
