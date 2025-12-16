
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

interface DumpsterQuantities {
  [key: string]: number;
}

export default function HaulingDumpstersPage2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const addQuantities: DumpsterQuantities = params.addQuantities
    ? JSON.parse(params.addQuantities as string)
    : {};
    
  const replaceQuantities: DumpsterQuantities = params.replaceQuantities
    ? JSON.parse(params.replaceQuantities as string)
    : {};

  const addItems = Object.entries(addQuantities).filter(([_, qty]) => qty > 0);
  const replaceItems = Object.entries(replaceQuantities).filter(([_, qty]) => qty > 0);

  const handleSubmit = () => {
    console.log('Submitting Hauling Dumpsters Request...');
    console.log('Add quantities:', addQuantities);
    console.log('Replace quantities:', replaceQuantities);
    
    // Navigate back to Dashboard
    router.back();
    router.back();
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
        <Text style={styles.headerTitle}>Hauling Dumpsters – Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Confirm you are requesting the following boxes:
        </Text>

        {/* To be added section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>To be added</Text>
          
          {addItems.length > 0 ? (
            <View style={styles.itemsContainer}>
              {addItems.map(([type, quantity], index) => (
                <View
                  key={index}
                  style={[
                    styles.summaryRow,
                    index === addItems.length - 1 && styles.summaryRowLast,
                  ]}
                >
                  <Text style={styles.itemType}>{type}</Text>
                  <Text style={styles.itemQuantity}>
                    {quantity} {quantity === 1 ? 'box' : 'boxes'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noneSelected}>None selected</Text>
          )}
        </View>

        {/* To be replaced section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>To be replaced</Text>
          
          {replaceItems.length > 0 ? (
            <View style={styles.itemsContainer}>
              {replaceItems.map(([type, quantity], index) => (
                <View
                  key={index}
                  style={[
                    styles.summaryRow,
                    index === replaceItems.length - 1 && styles.summaryRowLast,
                  ]}
                >
                  <Text style={styles.itemType}>{type}</Text>
                  <Text style={styles.itemQuantity}>
                    {quantity} {quantity === 1 ? 'box' : 'boxes'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noneSelected}>None selected</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
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
  instruction: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  itemType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noneSelected: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
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
