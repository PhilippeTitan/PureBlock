import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, BORDER_RADIUS, TAB_BAR_HEIGHT } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import EmergencyUnlock from '../components/EmergencyUnlock';
import { useAppStore } from '../store/StoreContext';
import { scheduleDailyMotivation, cancelAllNotifications } from '../services/notifications';
import { shareBackup, importBackup, parseBackupPreview } from '../services/backup';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { settings, updateSettings } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const success = await shareBackup();
      if (!success) {
        Alert.alert('Export Failed', 'Could not export backup file.');
      }
    } catch {
      Alert.alert('Export Failed', 'An error occurred while exporting.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setIsImporting(true);
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const json = await response.text();

      const preview = parseBackupPreview(json);
      if (!preview) {
        Alert.alert('Invalid File', 'This does not appear to be a valid PureBlock backup.');
        return;
      }

      Alert.alert(
        'Import Backup',
        `Restore backup from ${new Date(preview.exportedAt).toLocaleDateString()}?\n\nThis will replace your current data with:\n• ${preview.profiles.length} profiles\n• ${preview.blockedApps.length} blocked apps\n• ${preview.blockedWebsites.length} blocked websites\n• ${preview.schedules.length} schedules\n• ${preview.locations.length} locations`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              const result = await importBackup(json);
              if (result.success) {
                Alert.alert('Import Complete', result.message);
              } else {
                Alert.alert('Import Failed', result.message);
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert('Import Failed', 'Could not read the backup file.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + SPACING.md }
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
            value={settings.strictMode}
            onValueChange={(v) => updateSettings({ strictMode: v })}
            trackColor={{ false: COLORS.gray80, true: COLORS.primary + '80' }}
            thumbColor={settings.strictMode ? COLORS.primary : COLORS.gray40}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>PIN Protection</Text>
            <Text style={styles.settingDescription}>
              Require PIN to change settings
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {settings.pinHash ? 'Set' : 'Not Set'}
          </Text>
        </View>

        <EmergencyUnlock />
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
            value={settings.notificationsEnabled}
            onValueChange={async (v) => {
              await updateSettings({ notificationsEnabled: v });
              if (v) {
                await scheduleDailyMotivation();
              } else {
                await cancelAllNotifications();
              }
            }}
            trackColor={{ false: COLORS.gray80, true: COLORS.primary + '80' }}
            thumbColor={settings.notificationsEnabled ? COLORS.primary : COLORS.gray40}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Automation</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('LocationProfiles' as never)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Profiles</Text>
            <Text style={styles.settingDescription}>
              Auto-activate profiles based on your location
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray60} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Text style={styles.dataHint}>Save or restore your profiles, blocked apps, and settings.</Text>
        <View style={styles.dataGrid}>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="download-outline" size={22} color={COLORS.primary} />
            )}
            <Text style={styles.dataCardLabel}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dataCard}
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />
            )}
            <Text style={styles.dataCardLabel}>Import</Text>
          </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
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
  dataHint: {
    fontSize: 12,
    color: COLORS.gray40,
    marginBottom: SPACING.sm,
  },
  dataGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dataCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
  },
  dataCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
  },
});
