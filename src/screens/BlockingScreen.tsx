import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TAB_BAR_HEIGHT } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';
import { getInstalledApps, InstalledApp } from '../services/appLister';
import { BlockedApp } from '../types';

// Best-effort icon/color per well-known package, so the list isn't just plain text rows.
// Falls back to a neutral app icon for anything not in the table.
const APP_STYLE: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'com.instagram.android': { icon: 'logo-instagram', color: COLORS.primary },
  'com.zhiliaoapp.musically': { icon: 'logo-tiktok', color: COLORS.error },
  'com.google.android.youtube': { icon: 'logo-youtube', color: COLORS.accent },
  'com.twitter.android': { icon: 'logo-twitter', color: COLORS.info },
  'com.reddit.frontpage': { icon: 'logo-reddit', color: '#FF5700' },
  'com.facebook.katana': { icon: 'logo-facebook', color: COLORS.primary },
};

function getAppStyle(packageName: string) {
  return APP_STYLE[packageName] ?? { icon: 'apps' as const, color: COLORS.gray40 };
}

export default function BlockingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { blockedApps, removeBlockedApp, addBlockedApp, profiles } = useAppStore();
  const [showPicker, setShowPicker] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      const active = profiles.find(p => p.isActive);
      setSelectedProfileId(active?.id ?? profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const loadInstalledApps = async () => {
    const apps = await getInstalledApps();
    setInstalledApps(apps);
  };

  const openPicker = async () => {
    await loadInstalledApps();
    setShowPicker(true);
  };

  const handleAddApp = (app: InstalledApp) => {
    if (!selectedProfileId) return;
    const alreadyBlocked = blockedApps.some(
      b => b.packageName === app.packageName && b.profileId === selectedProfileId
    );
    if (!alreadyBlocked) {
      addBlockedApp(selectedProfileId, app.packageName, app.appName);
    }
    setShowPicker(false);
  };

  const filteredApps = installedApps.filter(
    app =>
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const blockedPackages = new Set(blockedApps.map(b => b.packageName));

  // Group blocked apps by profile so multi-profile users can see what belongs where.
  const groupedByProfile = useMemo(() => {
    const groups: { profileId: string; profileName: string; apps: BlockedApp[] }[] = [];
    profiles.forEach(profile => {
      const apps = blockedApps.filter(a => a.profileId === profile.id);
      if (apps.length > 0) {
        groups.push({ profileId: profile.id, profileName: profile.name, apps });
      }
    });
    // Any blocked apps whose profile no longer exists
    const orphaned = blockedApps.filter(a => !profiles.some(p => p.id === a.profileId));
    if (orphaned.length > 0) {
      groups.push({ profileId: 'orphaned', profileName: 'Unassigned', apps: orphaned });
    }
    return groups;
  }, [blockedApps, profiles]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Blocked apps" subtitle={`${blockedApps.length} apps blocked`} />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryAction} onPress={openPicker}>
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.primaryActionText}>Add app</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('Websites')}
        >
          <Ionicons name="globe-outline" size={18} color={COLORS.secondary} />
          <Text style={styles.secondaryActionText}>Websites</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + SPACING.md }
        ]}
      >
        {groupedByProfile.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="lock-closed-outline" size={40} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>No blocked apps yet</Text>
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={18} color={COLORS.accent} />
              <Text style={styles.tipText}>
                Tip: group apps by profile (Work, Sleep, Study) so you only block what
                matters for the moment.
              </Text>
            </View>
          </View>
        ) : (
          groupedByProfile.map(group => (
            <View key={group.profileId} style={styles.group}>
              <Text style={styles.groupTitle}>{group.profileName}</Text>
              {group.apps.map(item => {
                const style = getAppStyle(item.packageName);
                return (
                  <View key={item.id} style={styles.appCard}>
                    <View style={[styles.appIcon, { backgroundColor: style.color + '20' }]}>
                      <Ionicons name={style.icon} size={18} color={style.color} />
                    </View>
                    <View style={styles.appInfo}>
                      <Text style={styles.appName}>{item.appName}</Text>
                      <Text style={styles.packageName}>{item.packageName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeBlockedApp(item.id)} hitSlop={8}>
                      <Ionicons name="close" size={20} color={COLORS.gray40} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select app to block</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search apps..."
              placeholderTextColor={COLORS.gray40}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.packageName}
              style={styles.appList}
              renderItem={({ item }) => {
                const isBlocked = blockedPackages.has(item.packageName);
                const style = getAppStyle(item.packageName);
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, isBlocked && styles.pickerItemBlocked]}
                    onPress={() => !isBlocked && handleAddApp(item)}
                    disabled={isBlocked}
                  >
                    <View style={[styles.appIcon, { backgroundColor: style.color + '20' }]}>
                      <Ionicons name={style.icon} size={16} color={style.color} />
                    </View>
                    <View style={styles.pickerItemInfo}>
                      <Text style={styles.pickerItemName}>{item.appName}</Text>
                      <Text style={styles.pickerItemPackage}>{item.packageName}</Text>
                    </View>
                    {isBlocked ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  group: {
    marginBottom: SPACING.lg,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray40,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  tipCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray80,
    borderStyle: 'dashed',
    padding: SPACING.md,
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray40,
    lineHeight: 17,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.gray90,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
  },
  packageName: {
    fontSize: 11,
    color: COLORS.gray40,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.gray95,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray80,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  searchInput: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.gray90,
    borderRadius: 8,
    color: COLORS.white,
    fontSize: 16,
  },
  appList: {
    paddingHorizontal: SPACING.lg,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray80,
  },
  pickerItemBlocked: {
    opacity: 0.5,
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 15,
    color: COLORS.white,
  },
  pickerItemPackage: {
    fontSize: 11,
    color: COLORS.gray40,
    marginTop: 2,
  },
});
