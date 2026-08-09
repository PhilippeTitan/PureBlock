import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';

type TimeRange = 'daily' | 'weekly' | 'monthly';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMockData() {
  const now = new Date();
  const daily: number[] = [];
  const weekly: number[] = [];
  const monthly: number[] = [];

  for (let i = 6; i >= 0; i--) {
    daily.push(Math.floor(Math.random() * 12) + 1);
  }
  for (let i = 3; i >= 0; i--) {
    weekly.push(Math.floor(Math.random() * 60) + 10);
  }
  for (let i = 5; i >= 0; i--) {
    monthly.push(Math.floor(Math.random() * 200) + 30);
  }

  return { daily, weekly, monthly };
}

function getBarLabel(range: TimeRange, index: number): string {
  const now = new Date();
  if (range === 'daily') {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - index));
    return DAYS[d.getDay()];
  }
  if (range === 'weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() - (21 - index * 7));
    return `W${Math.ceil((d.getDate()) / 7)}`;
  }
  const d = new Date(now);
  d.setMonth(d.getMonth() - (5 - index));
  return MONTHS[d.getMonth()];
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { blockedApps, blockedWebsites, schedules, isBlocking, blockingSince } = useAppStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const mockData = useMemo(() => generateMockData(), []);

  const currentData = mockData[timeRange];
  const maxVal = Math.max(...currentData, 1);

  const totalBlockedAttempts = mockData.daily.reduce((a, b) => a + b, 0) +
    mockData.weekly.reduce((a, b) => a + b, 0) +
    mockData.monthly.reduce((a, b) => a + b, 0);

  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = mockData.daily.length - 1; i >= 0; i--) {
      if (mockData.daily[i] > 0) streak++;
      else break;
    }
    return streak;
  }, [mockData]);

  const blockingDuration = useMemo(() => {
    if (!blockingSince) return null;
    const diff = Date.now() - new Date(blockingSince).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [blockingSince]);

  const topApps = useMemo(() => {
    const counts: Record<string, number> = {};
    blockedApps.forEach(app => {
      counts[app.appName] = (counts[app.appName] || 0) + Math.floor(Math.random() * 20) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [blockedApps]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Statistics" subtitle="Your blocking activity" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardLarge]}>
            <View style={styles.statIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{blockedApps.length}</Text>
            <Text style={styles.statLabel}>Apps Blocked</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="globe" size={22} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{blockedWebsites.length}</Text>
            <Text style={styles.statLabel}>Sites Blocked</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="calendar" size={22} color={COLORS.accent} />
            </View>
            <Text style={styles.statValue}>{schedules.length}</Text>
            <Text style={styles.statLabel}>Schedules</Text>
          </View>
        </View>

        {/* Active Blocking Status */}
        {isBlocking && (
          <View style={styles.activeCard}>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeTitle}>Blocking Active</Text>
            </View>
            {blockingDuration && (
              <Text style={styles.activeDuration}>Running for {blockingDuration}</Text>
            )}
          </View>
        )}

        {/* Time Range Selector */}
        <View style={styles.rangeSelector}>
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeButton, timeRange === r && styles.rangeButtonActive]}
              onPress={() => setTimeRange(r)}
            >
              <Text style={[styles.rangeText, timeRange === r && styles.rangeTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Blocked Attempts Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Blocked Attempts</Text>
          <View style={styles.barChart}>
            {currentData.map((val, i) => (
              <View key={i} style={styles.barColumn}>
                <Text style={styles.barValue}>{val}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(val / maxVal) * 100}%`,
                        backgroundColor: val > maxVal * 0.7 ? COLORS.primary : COLORS.gray60,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{getBarLabel(timeRange, i)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Ionicons name="flame" size={20} color={COLORS.accent} />
            <Text style={styles.summaryValue}>{streakDays}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="time" size={20} color={COLORS.success} />
            <Text style={styles.summaryValue}>{totalBlockedAttempts}</Text>
            <Text style={styles.summaryLabel}>Total Blocked</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down" size={20} color={COLORS.info} />
            <Text style={styles.summaryValue}>-23%</Text>
            <Text style={styles.summaryLabel}>Usage Change</Text>
          </View>
        </View>

        {/* Top Blocked Apps */}
        {topApps.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.cardTitle}>Top Blocked Apps</Text>
            {topApps.map(([name, count], i) => (
              <View key={name} style={styles.listRow}>
                <View style={styles.listRank}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <Text style={styles.listName}>{name}</Text>
                <Text style={styles.listCount}>{count} blocks</Text>
              </View>
            ))}
          </View>
        )}

        {/* No Data State */}
        {blockedApps.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart" size={48} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>Demo Data Shown</Text>
            <Text style={styles.emptyDescription}>
              Add blocked apps to see real statistics. Current data is simulated.
            </Text>
          </View>
        )}
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
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statCardLarge: {
    flex: 1.5,
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
    fontSize: 22,
    fontWeight: '700',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  activeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeDuration: {
    fontSize: 13,
    color: COLORS.gray40,
    marginTop: SPACING.xs,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  rangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray40,
  },
  rangeTextActive: {
    color: COLORS.white,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: SPACING.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.gray40,
  },
  barTrack: {
    width: '100%',
    height: 100,
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
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.gray40,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray80,
  },
  listRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray40,
  },
  listName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
  },
  listCount: {
    fontSize: 13,
    color: COLORS.gray40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.md,
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
