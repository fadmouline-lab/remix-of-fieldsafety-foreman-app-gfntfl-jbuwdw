
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { session, currentEmployee, loading } = useAuth();

  console.log('Index screen - loading:', loading, 'session:', !!session, 'employee:', !!currentEmployee);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not authenticated - go to login
  if (!session) {
    console.log('No session, redirecting to login');
    return <Redirect href="/login" />;
  }

  // Authenticated but no employee record - go to account not setup
  if (!currentEmployee) {
    console.log('No employee record, redirecting to account not setup');
    return <Redirect href="/account-not-setup" />;
  }

  // Authenticated with employee record - go to select project
  console.log('Authenticated with employee, redirecting to select project');
  return <Redirect href="/select-project" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
