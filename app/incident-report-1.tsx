
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface PhotoAttachment {
  uri: string;
  id: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
    fontWeight: '500',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 10,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 18,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default function IncidentReportPage1() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [need911, setNeed911] = useState<'yes' | 'no' | null>(
    params.need911 ? (params.need911 as 'yes' | 'no') : null
  );
  const [called911, setCalled911] = useState<'yes' | 'no' | null>(
    params.called911 ? (params.called911 as 'yes' | 'no') : null
  );
  const [photos, setPhotos] = useState<PhotoAttachment[]>(
    params.photos ? JSON.parse(params.photos as string) : []
  );

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: PhotoAttachment = {
        uri: result.assets[0].uri,
        id: Date.now().toString(),
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const canProceed = () => {
    if (need911 === null) return false;
    if (need911 === 'yes' && called911 !== 'yes') return false;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    router.push({
      pathname: '/incident-report-2',
      params: {
        need911: need911 || '',
        called911: called911 || '',
        photos: JSON.stringify(photos),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow-back" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency & Injury Photos</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Do you need to call 911?</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  need911 === 'yes' && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setNeed911('yes');
                  setCalled911(null);
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    need911 === 'yes' && styles.toggleButtonTextActive,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  need911 === 'no' && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setNeed911('no');
                  setCalled911(null);
                }}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    need911 === 'no' && styles.toggleButtonTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {need911 === 'yes' && (
            <>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>I have called 911</Text>
                <View style={styles.toggleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      called911 === 'yes' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setCalled911('yes')}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        called911 === 'yes' && styles.toggleButtonTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      called911 === 'no' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setCalled911('no')}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        called911 === 'no' && styles.toggleButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {called911 === 'no' && (
                <Text style={styles.warningText}>
                  You must call 911 before proceeding
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <IconSymbol 
              ios_icon_name="camera.fill" 
              android_material_icon_name="camera" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.photoButtonText}>Take Photo</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoThumbnail}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={14} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!canProceed()}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
