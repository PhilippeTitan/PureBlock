import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { blockedApps, profiles, blockedWebsites } = useAppStore();

  const activeProfile = profiles.find(p => p.isActive);
  const hasBlockedApps = blockedApps.length > 0;

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
          <Text style={[styles.statusValue, hasBlockedApps && styles.statusActive]}>
            {hasBlockedApps ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statusDetail}>
            {activeProfile
              ? `Profile: ${activeProfile.name}`
              : 'No active blocking session'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{blockedApps.length}</Text>
            <Text style={styles.statLabel}>Blocked Apps</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="globe" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>{blockedWebsites.length}</Text>
            <Text style={styles.statLabel}>Blocked Sites</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color={COLORS.accent} />
            <Text style={styles.statNumber}>{profiles.length}</Text>
            <Text style={styles.statLabel}>Profiles</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => navigation.navigate('Blocking')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.quickButtonText}>Add Blocked App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonSecondary]}
            onPress={() => navigation.navigate('Profiles')}
          >
            <Ionicons name="people-outline" size={24} color={COLORS.gray20} />
            <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>
              Manage Profiles
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.blockerPreview}
          onPress={() => navigation.navigate('Blocker', { appName: 'Instagram', packageName: 'com.instagram.android' })}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.gray40} />
          <Text style={styles.blockerPreviewText}>Preview Blocking Screen</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray40} />
        </TouchableOpacity>
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
  statusActive: {
    color: COLORS.success,
  },
  statusDetail: {
    fontSize: 14,
    color: COLORS.gray40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
  },
  quickButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray80,
  },
  quickButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  quickButtonTextSecondary: {
    color: COLORS.gray20,
  },
  blockerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  blockerPreviewText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray40,
    marginLeft: SPACING.sm,
  },
});
