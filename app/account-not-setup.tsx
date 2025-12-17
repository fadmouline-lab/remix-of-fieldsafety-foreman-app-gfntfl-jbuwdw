
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountNotSetupScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="person.crop.circle.badge.exclamationmark"
            android_material_icon_name="person-off"
            size={80}
            color={colors.secondary}
          />
        </View>

        <Text style={styles.title}>Account Not Set Up</Text>
        
        <Text style={styles.message}>
          Your account hasn&apos;t been set up yet.{'\n\n'}
          Please contact your manager to complete your employee profile setup.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What to do next:</Text>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Contact your manager or supervisor
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Provide them with your email address
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              They will create your employee profile
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={buttonStyles.primary}
          onPress={handleLogout}
        >
          <Text style={buttonStyles.primaryText}>Back to Login</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
