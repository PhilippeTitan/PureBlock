import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { blockedApps, blockedWebsites, isBlocking, blockingSince } = useAppStore();

  const hasRealAttemptData = false;

  const blockingDuration = useMemo(() => {
    if (!blockingSince) return null;
    const diff = Date.now() - new Date(blockingSince).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [blockingSince]);

  const todayIndex = new Date().getDay();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Statistics" subtitle="Your blocking activity" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{blockedApps.length}</Text>
            <Text style={styles.statLabel}>Apps</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="globe" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{blockedWebsites.length}</Text>
            <Text style={styles.statLabel}>Sites</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="calendar" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>{isBlocking ? 1 : 0}</Text>
            <Text style={styles.statLabel}>Active now</Text>
          </View>
        </View>

        {isBlocking && (
          <View style={styles.activeCard}>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeTitle}>Blocking active</Text>
            </View>
            {blockingDuration && (
              <Text style={styles.activeDuration}>Running for {blockingDuration}</Text>
            )}
          </View>
        )}

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Blocked attempts this week</Text>
          {hasRealAttemptData ? (
            <View style={styles.barChart}>
              {DAYS.map((day, i) => (
                <View key={day} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: '40%', backgroundColor: i === todayIndex ? COLORS.primary : COLORS.gray60 },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={28} color={COLORS.gray60} />
              <Text style={styles.chartEmptyText}>
                Attempt tracking turns on once accessibility permissions are granted in Settings.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryLight} />
          <Text style={styles.infoText}>
            {hasRealAttemptData
              ? 'Showing real activity from your device.'
              : 'This screen shows counts of what you\'ve configured. Blocked-attempt history will appear here once native app monitoring is enabled.'}
          </Text>
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
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray40,
    textAlign: 'center',
  },
  activeCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  activeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeDuration: {
    fontSize: 13,
    color: COLORS.gray40,
    marginTop: SPACING.xs,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: SPACING.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: '100%',
    height: 90,
    backgroundColor: COLORS.gray90,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.gray40,
  },
  chartEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  chartEmptyText: {
    fontSize: 12,
    color: COLORS.gray40,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray40,
    lineHeight: 16,
  },
});
