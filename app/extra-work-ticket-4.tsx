
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ExtraWorkTicketSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const workers = params.workers ? JSON.parse(params.workers as string) : [];
  const equipmentQuantities = params.equipmentQuantities
    ? JSON.parse(params.equipmentQuantities as string)
    : {};
  const materialQuantities = params.materialQuantities
    ? JSON.parse(params.materialQuantities as string)
    : {};
  const selectedSubs = params.selectedSubs
    ? JSON.parse(params.selectedSubs as string)
    : [];
  const dumpsterQuantities = params.dumpsterQuantities
    ? JSON.parse(params.dumpsterQuantities as string)
    : {};

  const workersWithHours = workers.filter((w: any) => w.hours > 0);
  const equipmentWithQuantity = Object.entries(equipmentQuantities).filter(
    ([_, qty]) => (qty as number) > 0
  );
  const materialsWithQuantity = Object.entries(materialQuantities).filter(
    ([_, qty]) => (qty as number) > 0
  );
  const dumpstersWithQuantity = Object.entries(dumpsterQuantities).filter(
    ([_, qty]) => (qty as number) > 0
  );

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSubmit = () => {
    console.log('Submitting Extra Work Ticket');
    console.log('Workers:', workersWithHours);
    console.log('Equipment:', equipmentWithQuantity);
    console.log('Materials:', materialsWithQuantity);
    console.log('Subs:', selectedSubs);
    console.log('Dumpsters:', dumpstersWithQuantity);

    // Navigate back to Dashboard MORE FORMS tab
    router.push('/(tabs)/(home)');
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
        <Text style={styles.headerTitle}>Extra Work Ticket – Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User Name:</Text>
            <Text style={styles.infoValue}>Juan Perez</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project Address:</Text>
            <Text style={styles.infoValue}>123 Main Street, Chicago, IL 60611</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{currentTime}</Text>
          </View>
        </View>

        {/* Labor Section */}
        {workersWithHours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Labor</Text>
            <View style={styles.tableCard}>
              {workersWithHours.map((worker: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{worker.name}</Text>
                  <Text style={styles.tableValue}>{worker.hours.toFixed(1)} hrs</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment Section */}
        {equipmentWithQuantity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <View style={styles.tableCard}>
              {equipmentWithQuantity.map(([equipment, quantity], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{equipment}</Text>
                  <Text style={styles.tableValue}>{quantity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Materials Section */}
        {materialsWithQuantity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materials</Text>
            <View style={styles.tableCard}>
              {materialsWithQuantity.map(([material, quantity], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{material}</Text>
                  <Text style={styles.tableValue}>{quantity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Subs Section */}
        {selectedSubs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subs</Text>
            <View style={styles.tableCard}>
              {selectedSubs.map((sub: string, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{sub}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Hauling Section */}
        {dumpstersWithQuantity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hauling</Text>
            <View style={styles.tableCard}>
              {dumpstersWithQuantity.map(([dumpster, quantity], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{dumpster}</Text>
                  <Text style={styles.tableValue}>{quantity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT</Text>
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
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 2,
    textAlign: 'right',
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
  tableCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  tableValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
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
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
