import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import PomodoroTimer from '../components/PomodoroTimer';
import MoodCheckin, { shouldShowMoodCheckin } from '../components/MoodCheckin';
import { useAppStore } from '../store/StoreContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { blockedApps, profiles, blockedWebsites, isBlocking, blockingSince, toggleBlocking } = useAppStore();
  const [showMoodCheckin, setShowMoodCheckin] = useState(false);

  useEffect(() => {
    shouldShowMoodCheckin().then(show => setShowMoodCheckin(show));
  }, []);

  const activeProfile = profiles.find(p => p.isActive);
  const hasBlockedApps = blockedApps.length > 0;

  const getBlockingDuration = () => {
    if (!blockingSince) return '';
    const start = new Date(blockingSince);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="PureBlock" subtitle="Stay focused. Stay pure." />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
      >
        <TouchableOpacity
          style={[styles.statusCard, isBlocking && styles.statusCardActive]}
          onPress={toggleBlocking}
          activeOpacity={0.8}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Blocking Status</Text>
            <View style={[styles.statusDot, isBlocking && styles.statusDotActive]} />
          </View>
          <Text style={[styles.statusValue, isBlocking && styles.statusActive]}>
            {isBlocking ? 'Active' : 'Inactive'}
          </Text>
          {isBlocking ? (
            <Text style={styles.statusDetail}>
              Blocking for {getBlockingDuration()}
              {activeProfile ? ` • ${activeProfile.name}` : ''}
            </Text>
          ) : (
            <Text style={styles.statusDetail}>
              {hasBlockedApps
                ? `${blockedApps.length} apps ready to block`
                : 'No apps blocked yet'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBlockButton, isBlocking && styles.quickBlockButtonActive]}
          onPress={toggleBlocking}
        >
          <Ionicons
            name={isBlocking ? 'stop-circle' : 'play-circle'}
            size={32}
            color={COLORS.white}
          />
          <Text style={styles.quickBlockText}>
            {isBlocking ? 'Stop Blocking' : 'Start Quick Block'}
          </Text>
        </TouchableOpacity>

        <PomodoroTimer />

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
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.quickButtonText}>Add Blocked App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonSecondary]}
            onPress={() => navigation.navigate('Profiles')}
          >
            <Ionicons name="people-outline" size={20} color={COLORS.gray20} />
            <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>
              Profiles
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonSecondary]}
            onPress={() => navigation.navigate('LocationProfiles')}
          >
            <Ionicons name="location-outline" size={20} color={COLORS.gray20} />
            <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>
              Location Profiles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonSecondary]}
            onPress={() => navigation.navigate('Blocker', { appName: 'Instagram', packageName: 'com.instagram.android' })}
          >
            <Ionicons name="flask-outline" size={20} color={COLORS.gray20} />
            <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>
              Test Block
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MoodCheckin
        visible={showMoodCheckin}
        onClose={() => setShowMoodCheckin(false)}
        context={isBlocking ? 'after' : 'before'}
      />
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
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusCardActive: {
    borderColor: COLORS.success,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.gray40,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gray60,
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
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
  quickBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickBlockButtonActive: {
    backgroundColor: COLORS.error,
  },
  quickBlockText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
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
