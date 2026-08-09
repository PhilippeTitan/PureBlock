import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';
import { getDayName } from '../utils';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { schedules, deleteSchedule } = useAppStore();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Schedule" subtitle="Time-based blocking rules" onBack={() => navigation.goBack()} />
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={48} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>No schedules yet</Text>
            <Text style={styles.emptyDescription}>
              Set up time-based blocking rules for different parts of your day
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleInfo}>
              <Text style={styles.dayName}>{getDayName(item.dayOfWeek)}</Text>
              <Text style={styles.timeRange}>
                {item.startTime} - {item.endTime}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteSchedule(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
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
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  timeRange: {
    fontSize: 14,
    color: COLORS.gray40,
    marginTop: 2,
  },
});
