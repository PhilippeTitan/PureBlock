import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [strictMode, setStrictMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [dailyReport, setDailyReport] = React.useState(false);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }
        ]}
      >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Strict Mode</Text>
            <Text style={styles.settingDescription}>
              Prevents disabling blocking (requires Device Admin)
            </Text>
          </View>
          <Switch
            value={strictMode}
            onValueChange={setStrictMode}
            trackColor={{ false: COLORS.gray80, true: COLORS.primary + '80' }}
            thumbColor={strictMode ? COLORS.primary : COLORS.gray40}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>PIN Protection</Text>
            <Text style={styles.settingDescription}>
              Require PIN to change settings
            </Text>
          </View>
          <Text style={styles.settingValue}>Not Set</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified when apps are blocked
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: COLORS.gray80, true: COLORS.primary + '80' }}
            thumbColor={notifications ? COLORS.primary : COLORS.gray40}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Report</Text>
            <Text style={styles.settingDescription}>
              Receive daily blocking summary
            </Text>
          </View>
          <Switch
            value={dailyReport}
            onValueChange={setDailyReport}
            trackColor={{ false: COLORS.gray80, true: COLORS.primary + '80' }}
            thumbColor={dailyReport ? COLORS.primary : COLORS.gray40}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
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
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray40,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.gray40,
  },
});
