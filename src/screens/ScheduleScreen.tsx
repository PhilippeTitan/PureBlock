import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListHeaderComponent={
          <Text style={styles.title}>Schedule</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No schedules yet</Text>
            <Text style={styles.emptyDescription}>
              Set up time-based blocking rules for different parts of your day
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.gray40,
    textAlign: 'center',
  },
});
