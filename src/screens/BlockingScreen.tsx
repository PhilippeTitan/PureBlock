import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';
import { getInstalledApps, InstalledApp } from '../services/appLister';

export default function BlockingScreen() {
  const insets = useSafeAreaInsets();
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
          <View>
            <ScreenHeader title="Blocked Apps" subtitle={`${blockedApps.length} apps blocked`} />
            <TouchableOpacity style={styles.addButton} onPress={openPicker}>
              <Ionicons name="add-circle" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Add App to Block</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>No blocked apps yet</Text>
            <Text style={styles.emptyDescription}>
              Tap "Add App to Block" to select apps
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

      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select App to Block</Text>
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
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, isBlocked && styles.pickerItemBlocked]}
                    onPress={() => !isBlocked && handleAddApp(item)}
                    disabled={isBlocked}
                  >
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
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
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
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
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
    fontSize: 16,
    color: COLORS.white,
  },
  pickerItemPackage: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
});
