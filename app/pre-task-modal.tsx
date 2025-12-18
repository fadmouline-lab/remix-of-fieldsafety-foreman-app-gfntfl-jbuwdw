
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

interface PreTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PreTaskModal({ visible, onClose }: PreTaskModalProps) {
  const router = useRouter();
  const { canDuplicatePreTask } = useAuth();

  const handleDuplicateYesterday = () => {
    onClose();
    router.push({
      pathname: '/pre-task-select-tasks',
      params: { mode: 'DUPLICATE' },
    });
  };

  const handleStartNew = () => {
    onClose();
    router.push({
      pathname: '/pre-task-select-tasks',
      params: { mode: 'CREATE' },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Pre-Task Card</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !canDuplicatePreTask && styles.optionButtonDisabled,
              ]}
              onPress={handleDuplicateYesterday}
              activeOpacity={0.7}
              disabled={!canDuplicatePreTask}
            >
              <IconSymbol
                ios_icon_name="doc.on.doc.fill"
                android_material_icon_name="content-copy"
                size={32}
                color={canDuplicatePreTask ? colors.primary : colors.textSecondary}
              />
              <View style={styles.buttonTextContainer}>
                <Text
                  style={[
                    styles.buttonText,
                    !canDuplicatePreTask && styles.buttonTextDisabled,
                  ]}
                >
                  Duplicate Yesterday
                </Text>
                {!canDuplicatePreTask && (
                  <Text style={styles.helperText}>
                    No previous checklist was submitted for this project.
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleStartNew}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.buttonText}>Start New</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  buttonContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
