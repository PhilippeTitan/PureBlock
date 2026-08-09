import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="PureBlock" subtitle="Stay focused. Stay pure." />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
      >
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Blocking Status</Text>
          <Text style={styles.statusValue}>Inactive</Text>
          <Text style={styles.statusDetail}>No active blocking session</Text>
        </View>

        <View style={styles.quickActions}>
          <View style={styles.quickButton}>
            <Text style={styles.quickButtonText}>Quick Block</Text>
          </View>
          <View style={[styles.quickButton, styles.quickButtonSecondary]}>
            <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>
              View Stats
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.gray40,
    marginBottom: SPACING.xs,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray40,
    marginBottom: SPACING.xs,
  },
  statusDetail: {
    fontSize: 14,
    color: COLORS.gray40,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray80,
  },
  quickButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  quickButtonTextSecondary: {
    color: COLORS.gray20,
  },
});
