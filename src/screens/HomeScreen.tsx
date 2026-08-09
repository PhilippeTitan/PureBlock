import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, TAB_BAR_HEIGHT } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import PomodoroTimer from '../components/PomodoroTimer';
import MoodCheckin, { shouldShowMoodCheckin, getMoodStreak } from '../components/MoodCheckin';
import { useAppStore } from '../store/StoreContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { blockedApps, profiles, blockedWebsites, isBlocking, blockingSince, toggleBlocking } = useAppStore();
  const [showMoodBanner, setShowMoodBanner] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodStreak, setMoodStreak] = useState(0);

  useEffect(() => {
    shouldShowMoodCheckin().then(setShowMoodBanner);
    getMoodStreak().then(setMoodStreak);
  }, []);

  const activeProfile = profiles.find(p => p.isActive);

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

  const handleMoodSubmitted = () => {
    setShowMoodModal(false);
    setShowMoodBanner(false);
    getMoodStreak().then(setMoodStreak);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="PureBlock" subtitle="Stay focused. Stay pure." />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + SPACING.md }
        ]}
      >
        {/* Status + primary action, merged into a single card */}
        <View style={[styles.statusCard, isBlocking && styles.statusCardActive]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderLeft}>
              <View style={[styles.statusDot, isBlocking && styles.statusDotActive]} />
              <Text style={styles.statusLabel}>
                {isBlocking ? 'Blocking active' : 'Blocking inactive'}
              </Text>
            </View>
            {isBlocking && activeProfile && (
              <Text style={styles.statusProfile}>{activeProfile.name}</Text>
            )}
          </View>

          {isBlocking ? (
            <>
              <Text style={styles.statusValue}>{getBlockingDuration()}</Text>
              <Text style={styles.statusDetail}>
                {blockedApps.length} apps and {blockedWebsites.length} sites blocked
              </Text>
            </>
          ) : (
            <Text style={styles.statusDetail}>
              {blockedApps.length > 0
                ? `${blockedApps.length} apps ready to block`
                : 'No apps blocked yet'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.actionButton, isBlocking && styles.actionButtonActive]}
            onPress={toggleBlocking}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isBlocking ? 'stop-circle' : 'play-circle'}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.actionButtonText}>
              {isBlocking ? 'Stop blocking' : 'Start blocking'}
            </Text>
          </TouchableOpacity>
        </View>

        <PomodoroTimer />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
            <Text style={styles.statNumber}>{blockedApps.length}</Text>
            <Text style={styles.statLabel}>Apps</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="globe" size={20} color={COLORS.secondary} />
            <Text style={styles.statNumber}>{blockedWebsites.length}</Text>
            <Text style={styles.statLabel}>Sites</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color={COLORS.accent} />
            <Text style={styles.statNumber}>{moodStreak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Blocking')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add app to block</Text>
        </TouchableOpacity>

        {showMoodBanner && (
          <TouchableOpacity style={styles.moodBanner} onPress={() => setShowMoodModal(true)}>
            <Text style={styles.moodBannerEmoji}>🙂</Text>
            <Text style={styles.moodBannerText}>
              {isBlocking ? 'How was that session?' : 'How are you feeling today?'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray40} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <MoodCheckin
        visible={showMoodModal}
        onClose={handleMoodSubmitted}
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
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  statusCardActive: {
    borderColor: COLORS.success,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray60,
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.gray40,
  },
  statusProfile: {
    fontSize: 11,
    color: COLORS.gray60,
  },
  statusValue: {
    fontSize: 26,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 13,
    color: COLORS.gray40,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  actionButtonActive: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray40,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  moodBannerEmoji: {
    fontSize: 18,
  },
  moodBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray20,
  },
});
