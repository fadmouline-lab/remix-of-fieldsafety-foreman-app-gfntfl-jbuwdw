
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
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
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';

interface HaulingCompany {
  id: string;
  name: string;
  contact_name: string;
  phone_number: string;
  email: string;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: { marginRight: 12 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  companyDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function HaulingDumpstersPage0Screen() {
  const router = useRouter();
  const { currentEmployee } = useAuth();
  const [companies, setCompanies] = useState<HaulingCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<HaulingCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHaulingCompanies();
  }, []);

  const loadHaulingCompanies = async () => {
    try {
      if (!currentEmployee?.org_id) return;

      const { data, error } = await supabase
        .from('hauling_companies')
        .select('id, name, contact_name, phone_number, email')
        .eq('org_id', currentEmployee.org_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading hauling companies:', error);
      Alert.alert('Error', 'Failed to load hauling companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
  };

  const handleNext = () => {
    if (!selectedCompany) {
      Alert.alert('Required', 'Please select a hauling company');
      return;
    }

    router.push({
      pathname: '/hauling-dumpsters-1',
      params: {
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        companyContactName: selectedCompany.contact_name,
        companyPhone: selectedCompany.phone_number,
        companyEmail: selectedCompany.email,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Hauling Company</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Hauling Company</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCompanyId}
              onValueChange={handleCompanySelect}
              style={styles.picker}
            >
              <Picker.Item label="Select a company..." value="" />
              {companies.map(company => (
                <Picker.Item
                  key={company.id}
                  label={company.name}
                  value={company.id}
                />
              ))}
            </Picker>
          </View>

          {selectedCompany && (
            <View style={styles.companyDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact:</Text>
                <Text style={styles.detailValue}>{selectedCompany.contact_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedCompany.phone_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedCompany.email}</Text>
              </View>
            </View>
          )}
        </View>

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
      </ScrollView>
    </View>
  );
}
