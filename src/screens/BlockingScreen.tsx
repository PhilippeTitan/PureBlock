import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';

export default function BlockingScreen() {
  const insets = useSafeAreaInsets();
  const { blockedApps, removeBlockedApp } = useAppStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={blockedApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListHeaderComponent={
          <ScreenHeader title="Blocked Apps" subtitle={`${blockedApps.length} apps blocked`} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>No blocked apps yet</Text>
            <Text style={styles.emptyDescription}>
              Select a profile to add blocked apps
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.appCard}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{item.appName}</Text>
              <Text style={styles.packageName}>{item.packageName}</Text>
            </View>
            <TouchableOpacity onPress={() => removeBlockedApp(item.id)}>
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
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
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  packageName: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
});
