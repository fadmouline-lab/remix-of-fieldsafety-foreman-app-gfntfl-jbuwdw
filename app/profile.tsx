
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileField {
  labelKey: string;
  value: string;
  isPassword?: boolean;
}

const profileData: ProfileField[] = [
  { labelKey: 'profile.name', value: 'Juan Perez' },
  { labelKey: 'profile.userId', value: 'FSP-00123' },
  { labelKey: 'profile.email', value: 'juan.perez@example.com' },
  { labelKey: 'profile.company', value: 'US Dismantlement' },
  { labelKey: 'profile.role', value: 'Foreman' },
  { labelKey: 'profile.password', value: '********', isPassword: true },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={48}
                color={colors.card}
              />
            </View>
          </View>

          {profileData.map((field, index) => (
            <React.Fragment key={index}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t(field.labelKey)}</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
              {field.isPassword && (
                <Text style={styles.passwordNote}>
                  {t('profile.passwordNote')}
                </Text>
              )}
              {index < profileData.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={[buttonStyles.secondary, styles.backToDashboardButton]}
          onPress={handleBack}
        >
          <Text style={buttonStyles.secondaryText}>
            {t('profile.backToDashboard')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldRow: {
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  passwordNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  backToDashboardButton: {
    width: '100%',
  },
});
