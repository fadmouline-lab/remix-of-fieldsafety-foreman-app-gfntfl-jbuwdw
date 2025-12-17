
import React from 'react';
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
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function SelectProjectScreen() {
  const router = useRouter();
  const { 
    currentEmployee, 
    assignedProjects, 
    setCurrentProject, 
    loading,
  } = useAuth();

  const handleProjectSelect = (project: any) => {
    console.log('Selected project:', project);
    setCurrentProject(project);
    router.push('/(tabs)/(home)/');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

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
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Select Project</Text>
          <Text style={styles.subtitle}>Where are you working today?</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {assignedProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="folder.badge.questionmark"
              android_material_icon_name="folder-off"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Assigned Projects</Text>
            <Text style={styles.emptyText}>
              You don&apos;t have any projects assigned yet.{'\n'}
              Please contact your manager.
            </Text>
          </View>
        ) : (
          assignedProjects.map((project, index) => (
            <TouchableOpacity
              key={index}
              style={styles.projectCard}
              onPress={() => handleProjectSelect(project)}
              activeOpacity={0.7}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View
                  style={[
                    styles.statusPill,
                    project.status === 'active'
                      ? styles.statusLive
                      : styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {project.status === 'active' ? 'Live' : project.status === 'completed' ? 'Completed' : 'Planning'}
                  </Text>
                </View>
              </View>

              <View style={styles.projectDetails}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location-on"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.projectAddress}>{project.location || 'No location specified'}</Text>
              </View>

              {project.project_number && (
                <View style={styles.projectNumberContainer}>
                  <Text style={styles.projectNumberLabel}>Project #:</Text>
                  <Text style={styles.projectNumber}>{project.project_number}</Text>
                </View>
              )}

              <View style={styles.projectFooter}>
                <View style={styles.pmChip}>
                  <IconSymbol
                    ios_icon_name="building.2.fill"
                    android_material_icon_name="business"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.pmText}>
                    GC: {project.gc || 'N/A'}
                  </Text>
                </View>

                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  projectCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusLive: {
    backgroundColor: colors.success,
  },
  statusCompleted: {
    backgroundColor: colors.textSecondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
    textTransform: 'capitalize',
  },
  projectDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  projectAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  projectNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  projectNumberLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  projectNumber: {
    fontSize: 12,
    color: colors.text,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pmChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  pmText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
