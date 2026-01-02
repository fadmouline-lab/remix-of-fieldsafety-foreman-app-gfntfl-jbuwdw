
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface DumpsterQuantities {
  [key: string]: number;
}

const dumpsterTypes = [
  'Rubbish',
  'Heavy',
  'Concrete',
  'Scrap',
  'ACM',
  'Lead',
];

export default function HaulingDumpstersPage1Screen() {
  const router = useRouter();
  const [addExpanded, setAddExpanded] = useState(false);
  const [replaceExpanded, setReplaceExpanded] = useState(false);
  
  const [addQuantities, setAddQuantities] = useState<DumpsterQuantities>(
    dumpsterTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );
  
  const [replaceQuantities, setReplaceQuantities] = useState<DumpsterQuantities>(
    dumpsterTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );

  const handleQuantityChange = (
    section: 'add' | 'replace',
    type: string,
    delta: number
  ) => {
    if (section === 'add') {
      setAddQuantities((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + delta),
      }));
    } else {
      setReplaceQuantities((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + delta),
      }));
    }
  };

  const handleNext = () => {
    console.log('Navigating to Hauling Dumpsters Summary');
    console.log('Add quantities:', addQuantities);
    console.log('Replace quantities:', replaceQuantities);
    
    router.push({
      pathname: '/hauling-dumpsters-2',
      params: {
        addQuantities: JSON.stringify(addQuantities),
        replaceQuantities: JSON.stringify(replaceQuantities),
      },
    });
  };

  const renderQuantityControl = (
    section: 'add' | 'replace',
    type: string,
    quantity: number
  ) => (
    <View key={type} style={styles.quantityRow}>
      <Text style={styles.dumpsterType}>{type}</Text>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(section, type, -1)}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="minus.circle.fill"
            android_material_icon_name="remove-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        <Text style={styles.quantityValue}>{quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(section, type, 1)}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Hauling Dumpsters</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Request dumpsters to be added or replaced.
        </Text>

        {/* Add Dumpsters Card */}
        <TouchableOpacity
          style={styles.expandableCard}
          onPress={() => setAddExpanded(!addExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Add Dumpsters</Text>
            <IconSymbol
              ios_icon_name={addExpanded ? 'chevron.up' : 'chevron.down'}
              android_material_icon_name={
                addExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={24}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>

        {addExpanded && (
          <View style={styles.expandedContent}>
            {dumpsterTypes.map((type) =>
              renderQuantityControl('add', type, addQuantities[type])
            )}
          </View>
        )}

        {/* Replace Dumpsters Card */}
        <TouchableOpacity
          style={styles.expandableCard}
          onPress={() => setReplaceExpanded(!replaceExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Replace Dumpsters</Text>
            <IconSymbol
              ios_icon_name={replaceExpanded ? 'chevron.up' : 'chevron.down'}
              android_material_icon_name={
                replaceExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={24}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>

        {replaceExpanded && (
          <View style={styles.expandedContent}>
            {dumpsterTypes.map((type) =>
              renderQuantityControl('replace', type, replaceQuantities[type])
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    fontWeight: '500',
  },
  expandableCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  expandedContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: -8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dumpsterType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
});
