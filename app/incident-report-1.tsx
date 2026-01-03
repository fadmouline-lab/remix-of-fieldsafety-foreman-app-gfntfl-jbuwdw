
import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const IncidentReportPage1: React.FC = () => {
  const router = useRouter();
  const [need911, setNeed911] = useState<'yes' | 'no' | null>(null);
  const [called911, setCalled911] = useState<'yes' | 'no' | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    router.push({
      pathname: '/incident-report-2',
      params: {
        need911: need911 || '',
        called911: called911 || '',
        photos: JSON.stringify(photos),
      },
    });
  };

  const isNextDisabled = need911 === 'yes' && called911 === 'no';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency & Injury Photos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 911 Toggle */}
        <Text style={styles.label}>Do you need to call 911?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, need911 === 'yes' && styles.toggleButtonActive]}
            onPress={() => {
              setNeed911('yes');
              setCalled911(null);
            }}
          >
            <Text style={[styles.toggleText, need911 === 'yes' && styles.toggleTextActive]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, need911 === 'no' && styles.toggleButtonActive]}
            onPress={() => {
              setNeed911('no');
              setCalled911(null);
            }}
          >
            <Text style={[styles.toggleText, need911 === 'no' && styles.toggleTextActive]}>
              No
            </Text>
          </TouchableOpacity>
        </View>

        {/* Called 911 Toggle (conditional) */}
        {need911 === 'yes' && (
          <>
            <Text style={[styles.label, styles.marginTop]}>I have called 911</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, called911 === 'yes' && styles.toggleButtonActive]}
                onPress={() => setCalled911('yes')}
              >
                <Text style={[styles.toggleText, called911 === 'yes' && styles.toggleTextActive]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, called911 === 'no' && styles.toggleButtonActive]}
                onPress={() => setCalled911('no')}
              >
                <Text style={[styles.toggleText, called911 === 'no' && styles.toggleTextActive]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Photo Capture Section */}
        <Text style={[styles.label, styles.marginTop]}>Photos</Text>
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <IconSymbol name="camera" size={20} color={colors.primary} />
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>

        {photos.length > 0 && (
          <View style={styles.photoGrid}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoThumbnail}>
                <Image source={{ uri }} style={styles.thumbnailImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <IconSymbol name="xmark" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isNextDisabled}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  marginTop: {
    marginTop: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  toggleTextActive: {
    color: '#fff',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default IncidentReportPage1;
