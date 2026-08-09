import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

export default function BlockingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListHeaderComponent={
          <ScreenHeader title="Blocked Apps" subtitle="Select apps to block" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>No blocked apps yet</Text>
            <Text style={styles.emptyDescription}>
              Tap below to select apps you want to block
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
