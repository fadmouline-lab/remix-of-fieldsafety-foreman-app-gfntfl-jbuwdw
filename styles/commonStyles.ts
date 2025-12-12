
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#2196F3',
  secondary: '#F44336',
  accent: '#FFC107',
  card: '#FFFFFF',
  highlight: '#E0E0E0',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.highlight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
