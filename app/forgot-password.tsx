
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const handleCallManager = () => {
    const phoneNumber = '7089997575';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="lock.shield"
            android_material_icon_name="lock"
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Having trouble logging in?</Text>
        <Text style={styles.description}>
          Call your manager to reset your password.
        </Text>

        <View style={styles.managerCard}>
          <Text style={styles.managerLabel}>Manager</Text>
          <Text style={styles.managerName}>John Doe</Text>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={handleCallManager}
          >
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={colors.card}
            />
            <Text style={styles.phoneText}>(708) 999-7575</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[buttonStyles.secondary, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.secondaryText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  managerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  managerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  managerName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  backButton: {
    width: '100%',
  },
});
