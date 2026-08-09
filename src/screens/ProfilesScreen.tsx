import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/StoreContext';
import { Profile } from '../types';

export default function ProfilesScreen() {
  const insets = useSafeAreaInsets();
  const { profiles, addProfile, deleteProfile, updateProfile } = useAppStore();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    Alert.prompt('New Profile', 'Enter profile name', (name) => {
      if (name?.trim()) {
        addProfile(name.trim());
        setNewName('');
      }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Profile', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProfile(id) },
    ]);
  };

  const handleToggle = (profile: Profile) => {
    updateProfile(profile.id, { isActive: !profile.isActive });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profiles" subtitle="Manage blocking profiles" />
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Add Profile</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="person" size={48} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>No profiles yet</Text>
            <Text style={styles.emptyDescription}>
              Create different blocking profiles for work, sleep, or study
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.profileCard, item.isActive && styles.activeCard]}
            onPress={() => handleToggle(item)}
          >
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileStatus}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  profileStatus: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
});
