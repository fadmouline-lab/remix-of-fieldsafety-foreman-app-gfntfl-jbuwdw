
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface HaulingCompany {
  id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  contact_name: string | null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default function HaulingDumpstersPage0Screen() {
  const router = useRouter();
  const { currentEmployee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<HaulingCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<HaulingCompany | null>(null);

  useEffect(() => {
    loadHaulingCompanies();
  }, [currentEmployee]);

  const loadHaulingCompanies = async () => {
    if (!currentEmployee?.org_id) {
      console.log('No org_id available');
      setLoading(false);
      return;
    }

    try {
      // TODO: Backend Integration - Fetch hauling companies from public.hauling_companies
      const { data, error } = await supabase
        .from('hauling_companies')
        .select('id, name, phone_number, email, contact_name')
        .eq('org_id', currentEmployee.org_id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching hauling companies:', error);
        Alert.alert('Error', 'Failed to load hauling companies');
        setCompanies([]);
      } else {
        console.log('Loaded hauling companies:', data);
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Exception loading hauling companies:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedCompany) return;
    
    router.push({
      pathname: '/hauling-dumpsters-1',
      params: {
        haulingCompanyId: selectedCompany.id,
        haulingCompanyName: selectedCompany.name,
        haulingCompanyPhone: selectedCompany.phone_number || '',
        haulingCompanyEmail: selectedCompany.email || '',
        haulingCompanyContact: selectedCompany.contact_name || '',
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
        </View>

        <Text style={styles.label}>Select Hauling Company</Text>
        {companies.length === 0 ? (
          <Text style={styles.emptyText}>
            No active hauling companies available. Please contact your administrator.
          </Text>
        ) : (
          <View style={styles.dropdown}>
            {companies.map((company, index) => (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.dropdownItem,
                  index === companies.length - 1 && styles.dropdownItemLast,
                  selectedCompany?.id === company.id && styles.dropdownItemSelected,
                ]}
                onPress={() => setSelectedCompany(company)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCompany?.id === company.id && styles.selectedText,
                  ]}
                >
                  {company.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedCompany && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedCompany}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
