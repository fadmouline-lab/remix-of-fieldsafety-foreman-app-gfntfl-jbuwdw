
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (uri: string, durationSeconds: number) => void;
}

export default function VoiceRecorderModal({
  visible,
  onClose,
  onSave,
}: VoiceRecorderModalProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  
  // Audio player for playback preview - always call hooks unconditionally
  const player = useAudioPlayer(recordingUri || '');
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    if (visible) {
      console.log('Modal opened, requesting permissions...');
      requestPermissions();
    } else {
      // Reset state when modal closes
      setRecordingUri(null);
      setRecordingDuration(0);
      setIsPlaying(false);
      setIsPreparingRecorder(false);
    }
  }, [visible]);

  useEffect(() => {
    if (playerStatus && recordingUri) {
      setIsPlaying(playerStatus.isPlaying);
    }
  }, [playerStatus, recordingUri]);

  const requestPermissions = async () => {
    try {
      console.log('Requesting microphone permission...');
      const { granted, status } = await requestRecordingPermissionsAsync();
      
      console.log('Permission result:', { granted, status });
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice memos. Please enable it in your device settings.'
        );
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      console.log('Microphone permission granted');

      // Configure audio mode for recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      
      console.log('Audio mode configured for recording');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request microphone permission');
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      console.log('No permission, requesting...');
      await requestPermissions();
      return;
    }

    if (isPreparingRecorder) {
      console.log('Already preparing recorder, please wait...');
      return;
    }

    try {
      console.log('Starting recording...');
      setIsPreparingRecorder(true);
      
      // Reset previous recording
      setRecordingUri(null);
      setRecordingDuration(0);
      
      // Prepare the recorder
      console.log('Preparing recorder...');
      await audioRecorder.prepareToRecordAsync();
      console.log('Recorder prepared');
      
      // Start recording
      await audioRecorder.record();
      console.log('Recording started successfully');
      
      setIsPreparingRecorder(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsPreparingRecorder(false);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...');
      console.log('Current recorder state:', recorderState);
      
      await audioRecorder.stop();
      
      const uri = audioRecorder.uri;
      const duration = Math.floor(recorderState.currentTime);
      
      console.log('Recording stopped. URI:', uri);
      console.log('Duration:', duration, 'seconds');
      
      if (uri) {
        setRecordingUri(uri);
        setRecordingDuration(duration);
      } else {
        console.error('No URI after stopping recording');
        Alert.alert('Error', 'Failed to save recording');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const togglePlayback = () => {
    if (!player || !recordingUri) {
      console.log('No player or recording URI available');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing playback');
        player.pause();
      } else {
        console.log('Starting playback');
        // If at the end, seek to beginning
        if (playerStatus && playerStatus.currentTime >= playerStatus.duration) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const handleSave = () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording to save');
      return;
    }

    console.log('Saving recording:', recordingUri, 'Duration:', recordingDuration);
    onSave(recordingUri, recordingDuration);
    handleClose();
  };

  const handleClose = () => {
    console.log('Closing modal');
    
    // Stop playback if playing
    if (player && isPlaying) {
      try {
        player.pause();
      } catch (error) {
        console.error('Error pausing player on close:', error);
      }
    }
    
    // Reset state
    setRecordingUri(null);
    setRecordingDuration(0);
    setIsPlaying(false);
    setIsPreparingRecorder(false);
    
    onClose();
  };

  const handleDelete = () => {
    console.log('Deleting recording');
    setRecordingUri(null);
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Voice Memo</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!hasPermission ? (
              <View style={styles.permissionContainer}>
                <IconSymbol
                  ios_icon_name="mic.slash"
                  android_material_icon_name="mic-off"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.permissionText}>
                  Microphone permission is required to record voice memos.
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            ) : recordingUri ? (
              // Preview mode
              <View style={styles.previewContainer}>
                <View style={styles.waveformContainer}>
                  <IconSymbol
                    ios_icon_name="waveform"
                    android_material_icon_name="graphic-eq"
                    size={80}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.durationText}>
                  {formatDuration(recordingDuration)}
                </Text>

                <View style={styles.previewControls}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={togglePlayback}
                  >
                    <IconSymbol
                      ios_icon_name={isPlaying ? 'pause.fill' : 'play.fill'}
                      android_material_icon_name={isPlaying ? 'pause' : 'play-arrow'}
                      size={32}
                      color={colors.card}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <IconSymbol
                      ios_icon_name="trash"
                      android_material_icon_name="delete"
                      size={24}
                      color={colors.secondary}
                    />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save Voice Memo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Recording mode
              <View style={styles.recordingContainer}>
                <View style={styles.micContainer}>
                  <View
                    style={[
                      styles.micCircle,
                      recorderState.isRecording && styles.micCircleActive,
                    ]}
                  >
                    <IconSymbol
                      ios_icon_name="mic.fill"
                      android_material_icon_name="mic"
                      size={64}
                      color={
                        recorderState.isRecording ? colors.secondary : colors.primary
                      }
                    />
                  </View>
                </View>

                {recorderState.isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording...</Text>
                  </View>
                )}

                {recorderState.isRecording && (
                  <Text style={styles.timerText}>
                    {formatDuration(Math.floor(recorderState.currentTime))}
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    recorderState.isRecording && styles.recordButtonActive,
                    isPreparingRecorder && styles.recordButtonDisabled,
                  ]}
                  onPress={
                    recorderState.isRecording ? stopRecording : startRecording
                  }
                  disabled={isPreparingRecorder}
                >
                  <Text style={styles.recordButtonText}>
                    {isPreparingRecorder
                      ? 'Preparing...'
                      : recorderState.isRecording
                      ? 'Stop Recording'
                      : 'Start Recording'}
                  </Text>
                </TouchableOpacity>

                {recorderState.isRecording && (
                  <Text style={styles.hintText}>
                    Tap &quot;Stop Recording&quot; when finished
                  </Text>
                )}
                
                {!recorderState.isRecording && !isPreparingRecorder && (
                  <Text style={styles.hintText}>
                    Tap &quot;Start Recording&quot; to begin
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  permissionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  micContainer: {
    marginBottom: 32,
  },
  micCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  micCircleActive: {
    borderColor: colors.secondary,
    boxShadow: '0px 4px 24px rgba(255, 59, 48, 0.3)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
  },
  recordButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: colors.secondary,
  },
  recordButtonDisabled: {
    opacity: 0.6,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waveformContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  durationText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
  },
  previewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
