
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import VoiceRecorderModal from '@/components/VoiceRecorderModal';

export default function DailyActivityLogPage2() {
  const router = useRouter();
  const {
    photos,
    voiceMemos,
    generalNotes,
    setPhotos,
    setVoiceMemos,
    setGeneralNotes,
  } = useActivityLog();

  const [showRecorderModal, setShowRecorderModal] = React.useState(false);

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          uri: result.assets[0].uri,
          mimeType: 'image/jpeg',
          isExisting: false,
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleRecordVoiceMemo = () => {
    console.log('Opening voice recorder modal...');
    setShowRecorderModal(true);
  };

  const handleSaveVoiceMemo = (uri: string, durationSeconds: number) => {
    console.log('Saving voice memo:', uri, durationSeconds);
    
    const newMemo = {
      id: Date.now().toString(),
      uri,
      duration: formatDuration(durationSeconds),
      durationSeconds,
      isExisting: false,
    };
    
    setVoiceMemos([...voiceMemos, newMemo]);
    setShowRecorderModal(false);
  };

  const handleDeleteVoiceMemo = (id: string) => {
    setVoiceMemos(voiceMemos.filter((memo) => memo.id !== id));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    console.log('Navigating to summary page...');
    console.log('Photos:', photos.length);
    console.log('Notes:', generalNotes);
    console.log('Voice Memos:', voiceMemos.length);
    
    router.push('/daily-activity-log-3');
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
        <Text style={styles.headerTitle}>Daily Activity Log – Notes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Capture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="photo-camera"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <ScrollView
              horizontal
              style={styles.photoScroll}
              contentContainerStyle={styles.photoScrollContent}
              showsHorizontalScrollIndicator={false}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
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
            </ScrollView>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about today's activity…"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={generalNotes}
            onChangeText={setGeneralNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Voice Memo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Memos</Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordVoiceMemo}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="mic.fill"
              android_material_icon_name="mic"
              size={24}
              color={colors.card}
            />
            <Text style={styles.recordButtonText}>Add Voice Memo</Text>
          </TouchableOpacity>

          {voiceMemos.length > 0 && (
            <View style={styles.memoList}>
              {voiceMemos.map((memo, index) => (
                <View key={index} style={styles.memoItem}>
                  <View style={styles.memoContent}>
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
                  <TouchableOpacity
                    style={styles.deleteMemoButton}
                    onPress={() => handleDeleteVoiceMemo(memo.id)}
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

      <VoiceRecorderModal
        visible={showRecorderModal}
        onClose={() => setShowRecorderModal(false)}
        onSave={handleSaveVoiceMemo}
      />
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
  cameraButton: {
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
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  photoScroll: {
    marginTop: 12,
  },
  photoScrollContent: {
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.highlight,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
  memoList: {
    marginTop: 12,
    gap: 12,
  },
  memoItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  memoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memoInfo: {
    flex: 1,
  },
  memoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memoDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteMemoButton: {
    padding: 4,
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
