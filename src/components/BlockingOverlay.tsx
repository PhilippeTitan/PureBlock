import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';

interface BlockingOverlayProps {
  appName?: string;
  onDismiss?: () => void;
  onOpenSettings?: () => void;
}

export default function BlockingOverlay({
  appName = 'This app',
  onDismiss,
  onOpenSettings,
}: BlockingOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>App Blocked</Text>
        <Text style={styles.subtitle}>{appName} is currently blocked</Text>

        <Text style={styles.message}>
          Stay focused! You've chosen to block this app during your focus time.
        </Text>

        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            "The secret of getting ahead is getting started."
          </Text>
          <Text style={styles.quoteAuthor}>— Mark Twain</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onDismiss}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsLink}
          onPress={onOpenSettings}
        >
          <Text style={styles.settingsText}>Open PureBlock Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    maxWidth: 350,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 16,
    color: COLORS.gray40,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  quoteContainer: {
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  quote: {
    fontSize: 14,
    color: COLORS.gray20,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: COLORS.gray40,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  settingsLink: {
    padding: SPACING.sm,
  },
  settingsText: {
    fontSize: 14,
    color: COLORS.gray40,
    textDecorationLine: 'underline',
  },
});
