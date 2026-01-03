
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface SearchableDropdownProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: { id: string; name: string }[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  multiSelect?: boolean;
  loading?: boolean;
  initialLimit?: number;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  checkmark: {
    marginRight: 8,
  },
  viewMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    padding: 32,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
  },
});

export default function SearchableDropdown({
  visible,
  onClose,
  title,
  items,
  selectedIds,
  onToggleItem,
  multiSelect = true,
  loading = false,
  initialLimit = 20,
}: SearchableDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Apply truncation if not showing all
  const displayedItems = useMemo(() => {
    if (showAll || searchQuery.trim()) {
      return filteredItems;
    }
    return filteredItems.slice(0, initialLimit);
  }, [filteredItems, showAll, searchQuery, initialLimit]);

  const hasMore = !showAll && !searchQuery.trim() && filteredItems.length > initialLimit;

  const handleToggle = (id: string) => {
    onToggleItem(id);
    if (!multiSelect) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : displayedItems.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No results found' : 'No items available'}
            </Text>
          ) : (
            <>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {displayedItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalOption}
                    onPress={() => handleToggle(item.id)}
                  >
                    {multiSelect && (
                      <Text style={styles.checkmark}>
                        {selectedIds.includes(item.id) ? '✓ ' : '  '}
                      </Text>
                    )}
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {hasMore && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={styles.viewMoreText}>
                    View {filteredItems.length - initialLimit} more...
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
