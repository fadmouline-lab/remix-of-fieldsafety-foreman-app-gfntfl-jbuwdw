
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentEmployee } = useAuth();
  
  const [organizationName, setOrganizationName] = useState<string>('');
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [orgError, setOrgError] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!currentEmployee?.org_id) {
        console.log('No org_id found in currentEmployee');
        setLoadingOrg(false);
        setOrgError(true);
        return;
      }

      try {
        console.log('Fetching organization with id:', currentEmployee.org_id);
        const { data, error } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', currentEmployee.org_id)
          .single();

        if (error) {
          console.error('Error fetching organization:', error);
          setOrgError(true);
        } else if (data) {
          console.log('Organization fetched:', data.name);
          setOrganizationName(data.name);
        } else {
          console.log('No organization data found');
          setOrgError(true);
        }
      } catch (error) {
        console.error('Exception fetching organization:', error);
        setOrgError(true);
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrganization();
  }, [currentEmployee?.org_id]);

  const handleBack = () => {
    router.back();
  };

  // Construct display values from currentEmployee
  const displayName = currentEmployee 
    ? `${currentEmployee.first_name} ${currentEmployee.last_name}` 
    : 'N/A';
  const displayUserId = currentEmployee?.user_id || 'N/A';
  const displayEmail = currentEmployee?.email || 'N/A';
  const displayRole = currentEmployee?.role || 'N/A';
  const displayCompany = loadingOrg 
    ? '' 
    : orgError 
      ? 'Company unavailable' 
      : organizationName || 'Company unavailable';

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

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.name')}</Text>
            <Text style={styles.fieldValue}>{displayName}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.userId')}</Text>
            <Text style={styles.fieldValue}>{displayUserId}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.email')}</Text>
            <Text style={styles.fieldValue}>{displayEmail}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.company')}</Text>
            {loadingOrg ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.fieldValue}>{displayCompany}</Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.role')}</Text>
            <Text style={styles.fieldValue}>{displayRole}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{t('profile.password')}</Text>
            <Text style={styles.fieldValue}>********</Text>
          </View>
          <Text style={styles.passwordNote}>
            {t('profile.passwordNote')}
          </Text>
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
