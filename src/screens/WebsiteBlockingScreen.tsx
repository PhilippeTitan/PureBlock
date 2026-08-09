import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';

const SUGGESTED_URLS = [
  { label: ' Pornhub', url: 'pornhub.com' },
  { label: ' XVideos', url: 'xvideos.com' },
  { label: ' XNXX', url: 'xnxx.com' },
  { label: ' Reddit (nsfw)', url: 'reddit.com/r/nsfw' },
  { label: ' Twitter (nsfw)', url: 'x.com' },
  { label: ' Instagram', url: 'instagram.com' },
  { label: ' TikTok', url: 'tiktok.com' },
  { label: ' YouTube', url: 'youtube.com' },
  { label: ' Twitter/X', url: 'twitter.com' },
  { label: ' Facebook', url: 'facebook.com' },
];

export default function WebsiteBlockingScreen() {
  const insets = useSafeAreaInsets();
  const { blockedWebsites, removeBlockedWebsite, addBlockedWebsite, profiles } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      const active = profiles.find(p => p.isActive);
      setSelectedProfileId(active?.id ?? profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const handleAddUrl = (url: string) => {
    if (!selectedProfileId || !url.trim()) return;
    const clean = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (!clean) return;
    const alreadyBlocked = blockedWebsites.some(
      w => w.url === clean && w.profileId === selectedProfileId
    );
    if (!alreadyBlocked) {
      addBlockedWebsite(selectedProfileId, clean);
    }
    setUrlInput('');
    setShowAddModal(false);
  };

  const handleAddFromInput = () => {
    handleAddUrl(urlInput);
  };

  const profileBlocked = selectedProfileId
    ? blockedWebsites.filter(w => w.profileId === selectedProfileId)
    : blockedWebsites;

  return (
    <View style={styles.container}>
      <FlatList
        data={profileBlocked}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Blocked Websites"
              subtitle={`${profileBlocked.length} websites blocked`}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Add Website to Block</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="globe" size={48} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>No blocked websites yet</Text>
            <Text style={styles.emptyDescription}>
              Tap "Add Website to Block" to enter a URL
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.urlCard}>
            <View style={styles.urlInfo}>
              <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
              <Text style={styles.urlText}>{item.url}</Text>
            </View>
            <TouchableOpacity onPress={() => removeBlockedWebsite(item.id)}>
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Website</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="e.g. instagram.com"
                placeholderTextColor={COLORS.gray60}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.inputButton, !urlInput.trim() && styles.inputButtonDisabled]}
                onPress={handleAddFromInput}
                disabled={!urlInput.trim()}
              >
                <Ionicons name="add" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Suggested</Text>
            <FlatList
              data={SUGGESTED_URLS}
              keyExtractor={(item) => item.url}
              style={styles.suggestList}
              renderItem={({ item }) => {
                const isBlocked = blockedWebsites.some(w => w.url === item.url);
                return (
                  <TouchableOpacity
                    style={[styles.suggestItem, isBlocked && styles.suggestItemBlocked]}
                    onPress={() => !isBlocked && handleAddUrl(item.url)}
                    disabled={isBlocked}
                  >
                    <Text style={styles.suggestUrl}>{item.url}</Text>
                    {isBlocked ? (
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
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
  urlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  urlInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  urlText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
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
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.gray90,
    borderRadius: 8,
    color: COLORS.white,
    fontSize: 16,
  },
  inputButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputButtonDisabled: {
    opacity: 0.4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray40,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  suggestList: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 260,
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray80,
  },
  suggestItemBlocked: {
    opacity: 0.5,
  },
  suggestUrl: {
    fontSize: 15,
    color: COLORS.white,
  },
});
