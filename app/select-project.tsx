
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Project {
  id: string;
  name: string;
  address: string;
  projectManager: string;
  status: 'Live' | 'Completed';
}

const projects: Project[] = [
  {
    id: '1',
    name: 'UIC',
    address: 'Random Address, 60611',
    projectManager: 'Sara',
    status: 'Live',
  },
  {
    id: '2',
    name: 'North Lasalle',
    address: 'Random Address, 60611',
    projectManager: 'Yasmine',
    status: 'Live',
  },
  {
    id: '3',
    name: 'South Wabash',
    address: 'Random Address, 60611',
    projectManager: 'Zach',
    status: 'Live',
  },
  {
    id: '4',
    name: 'Burger King',
    address: 'Random Address, 60611',
    projectManager: 'Joanna',
    status: 'Completed',
  },
];

export default function SelectProjectScreen() {
  const router = useRouter();

  const handleProjectSelect = (project: Project) => {
    console.log('Selected project:', project);
    router.push('/(tabs)/(home)/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Project</Text>
        <Text style={styles.subtitle}>Where are you working today?</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {projects.map((project, index) => (
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
                  project.status === 'Live'
                    ? styles.statusLive
                    : styles.statusCompleted,
                ]}
              >
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>

            <View style={styles.projectDetails}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.projectAddress}>{project.address}</Text>
            </View>

            <View style={styles.projectFooter}>
              <View style={styles.pmChip}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.pmText}>
                  PM: {project.projectManager}
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
        ))}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
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
