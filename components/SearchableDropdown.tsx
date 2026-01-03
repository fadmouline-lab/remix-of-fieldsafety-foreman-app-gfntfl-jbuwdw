
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface DropdownOption {
  label: string;
  value: string;
}

interface SearchableDropdownProps {
  data: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue: string | null;
  multiSelect?: boolean;
  selectedValues?: string[];
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownButtonPlaceholder: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
    fontSize: 15,
  },
});

export default function SearchableDropdown({
  data,
  placeholder,
  onSelect,
  selectedValue,
  multiSelect = false,
  selectedValues = [],
}: SearchableDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data || [];
    const query = searchQuery.toLowerCase();
    return (data || []).filter((item) =>
      item.label.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const displayText = useMemo(() => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const item = data?.find((d) => d.value === selectedValues[0]);
        return item?.label || placeholder;
      }
      return `${selectedValues.length} selected`;
    } else {
      if (!selectedValue) return placeholder;
      const item = data?.find((d) => d.value === selectedValue);
      return item?.label || placeholder;
    }
  }, [data, selectedValue, selectedValues, multiSelect, placeholder]);

  const handleSelect = (value: string) => {
    onSelect(value);
    if (!multiSelect) {
      setModalVisible(false);
      setSearchQuery('');
    }
  };

  const isSelected = (value: string) => {
    if (multiSelect) {
      return selectedValues.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            (!selectedValue && !multiSelect) || (multiSelect && selectedValues.length === 0)
              ? styles.dropdownButtonPlaceholder
              : null,
          ]}
        >
          {displayText}
        </Text>
        <IconSymbol 
          ios_icon_name="chevron.down" 
          android_material_icon_name="arrow-drop-down" 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setSearchQuery('');
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{placeholder}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />

              <ScrollView style={styles.optionsList}>
                {filteredData.length === 0 ? (
                  <Text style={styles.emptyText}>No results found</Text>
                ) : (
                  filteredData.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.optionItem}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                      {isSelected(item.value) && (
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={20}
                          color={colors.primary}
                          style={styles.selectedIndicator}
                        />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
