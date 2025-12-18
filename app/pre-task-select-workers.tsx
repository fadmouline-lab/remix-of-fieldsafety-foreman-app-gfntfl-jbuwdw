
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
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface SelectedWorker {
  employee_id: string;
  full_name: string;
}

export default function PreTaskSelectWorkersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentEmployee } = useAuth();
  
  const [allWorkers, setAllWorkers] = useState<Employee[]>([]);
  const [displayedWorkers, setDisplayedWorkers] = useState<Employee[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<SelectedWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(10);

  const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];

  useEffect(() => {
    loadWorkers();
  }, [currentEmployee]);

  useEffect(() => {
    filterAndDisplayWorkers();
  }, [allWorkers, searchQuery, displayCount]);

  const loadWorkers = async () => {
    if (!currentEmployee) {
      console.log('No current employee');
      Alert.alert('Error', 'Employee data not loaded. Please try logging in again.');
      setLoading(false);
      return;
    }

    console.log('Loading workers for org:', currentEmployee.org_id);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role')
        .eq('org_id', currentEmployee.org_id)
        .eq('status', 'Active')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching workers:', error);
        Alert.alert('Error', 'Failed to load workers. Please try again.');
        setAllWorkers([]);
      } else {
        console.log('Workers loaded:', data?.length || 0);
        setAllWorkers(data || []);
        
        // Auto-select the current employee
        if (currentEmployee) {
          const currentWorker = data?.find((w) => w.id === currentEmployee.id);
          if (currentWorker) {
            setSelectedWorkers([{
              employee_id: currentWorker.id,
              full_name: `${currentWorker.first_name} ${currentWorker.last_name}`,
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Exception loading workers:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      setAllWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndDisplayWorkers = () => {
    let filtered = [...allWorkers];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.first_name.toLowerCase().includes(query) ||
          w.last_name.toLowerCase().includes(query)
      );
    }

    // Separate pinned user (current employee) and others
    const pinnedUser = filtered.find((w) => w.id === currentEmployee?.id);
    const otherUsers = filtered.filter((w) => w.id !== currentEmployee?.id);

    // Limit other users to displayCount
    const limitedOthers = otherUsers.slice(0, displayCount);

    // Combine pinned user at top with limited others
    const result = pinnedUser ? [pinnedUser, ...limitedOthers] : limitedOthers;
    setDisplayedWorkers(result);
  };

  const toggleWorker = (worker: Employee) => {
    const fullName = `${worker.first_name} ${worker.last_name}`;
    const isSelected = selectedWorkers.some((w) => w.employee_id === worker.id);
    
    if (isSelected) {
      setSelectedWorkers(selectedWorkers.filter((w) => w.employee_id !== worker.id));
    } else {
      setSelectedWorkers([
        ...selectedWorkers,
        { employee_id: worker.id, full_name: fullName },
      ]);
    }
  };

  const handleShowMore = () => {
    setDisplayCount(displayCount + 10);
  };

  const handleNext = () => {
    console.log('Selected workers:', selectedWorkers.length);
    router.push({
      pathname: '/pre-task-summary',
      params: {
        tasks: JSON.stringify(tasks),
        workers: JSON.stringify(selectedWorkers),
      },
    });
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Pre-Task Card – Workers</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading workers...</Text>
        </View>
      </View>
    );
  }

  const hasMoreWorkers = allWorkers.filter((w) => w.id !== currentEmployee?.id).length > displayCount;

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
        <Text style={styles.headerTitle}>Pre-Task Card – Workers</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workers..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>Select workers for today.</Text>

        <View style={styles.workerList}>
          {displayedWorkers.map((worker, index) => {
            const isSelected = selectedWorkers.some((w) => w.employee_id === worker.id);
            const isPinned = worker.id === currentEmployee?.id;
            const fullName = `${worker.first_name} ${worker.last_name}`;
            
            return (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.workerBox,
                    isSelected && styles.workerBoxSelected,
                  ]}
                  onPress={() => toggleWorker(worker)}
                  activeOpacity={0.7}
                >
                  <View style={styles.workerContent}>
                    <View style={styles.workerIcon}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={24}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <View style={styles.workerInfo}>
                      <Text
                        style={[
                          styles.workerText,
                          isSelected && styles.workerTextSelected,
                        ]}
                      >
                        {fullName}
                        {isPinned && ' (You)'}
                      </Text>
                      <Text style={styles.workerRole}>{worker.role}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {hasMoreWorkers && !searchQuery && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>Show More</Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="expand-more"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedWorkers.length === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedWorkers.length === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.nextButtonText,
              selectedWorkers.length === 0 && styles.nextButtonTextDisabled,
            ]}
          >
            NEXT ({selectedWorkers.length} selected)
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
  workerList: {
    gap: 12,
  },
  workerBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  workerBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  workerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfo: {
    flex: 1,
  },
  workerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workerTextSelected: {
    color: colors.primary,
  },
  workerRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 12,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
  nextButtonDisabled: {
    backgroundColor: colors.highlight,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
  nextButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
