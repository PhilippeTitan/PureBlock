import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { useAppStore } from '../store/StoreContext';
import ScreenHeader from '../components/ScreenHeader';

const RADIUS_PRESETS = [100, 200, 500, 1000, 2000];

export default function LocationProfilesScreen() {
  const insets = useSafeAreaInsets();
  const { locations, profiles, addLocation, deleteLocation, toggleLocation } = useAppStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRadius, setNewRadius] = useState(200);
  const [newProfileId, setNewProfileId] = useState('');
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (profiles.length > 0 && !newProfileId) {
      setNewProfileId(profiles[0].id);
    }
  }, [profiles]);

  const detectLocation = async () => {
    if (Platform.OS === 'web') return;
    setIsDetecting(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to detect your current position.');
        setIsDetecting(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setDetectedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setShowAddModal(true);
    } catch (err: any) {
      if (err?.code === 'E_LOCATION_SERVICES_DISABLED') {
        Alert.alert('GPS Disabled', 'Please enable Location Services in your phone settings.');
      } else {
        Alert.alert('Error', 'Could not detect location. Make sure you are outdoors or near a window.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a name for this location.');
      return;
    }
    if (!detectedCoords) {
      Alert.alert('Error', 'No location detected. Please detect your location first.');
      return;
    }
    if (!newProfileId) {
      Alert.alert('Error', 'Please select a profile to activate at this location.');
      return;
    }

    await addLocation(
      newName.trim(),
      detectedCoords.lat,
      detectedCoords.lng,
      newRadius,
      newProfileId
    );

    setShowAddModal(false);
    setNewName('');
    setNewRadius(200);
    setDetectedCoords(null);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Location',
      `Remove "${name}" from your saved locations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLocation(id) },
      ]
    );
  };

  const getProfileName = (profileId: string) => {
    return profiles.find(p => p.id === profileId)?.name || 'Unknown Profile';
  };

  const getRadiusLabel = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Location Profiles" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Saved Locations</Text>
        <Text style={styles.sectionSubtitle}>
          Auto-activate a blocking profile when you arrive at a location
        </Text>

        {locations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={COLORS.gray60} />
            <Text style={styles.emptyTitle}>No saved locations</Text>
            <Text style={styles.emptySubtitle}>
              Add a location to automatically activate a profile when you arrive
            </Text>
          </View>
        ) : (
          locations.map(loc => (
            <View key={loc.id} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIcon}>
                  <Ionicons
                    name={loc.isActive ? 'location' : 'location-outline'}
                    size={24}
                    color={loc.isActive ? COLORS.primary : COLORS.gray60}
                  />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{loc.name}</Text>
                  <Text style={styles.locationMeta}>
                    Radius: {getRadiusLabel(loc.radius)} · Profile: {getProfileName(loc.profileId)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => toggleLocation(loc.id)}
                >
                  <View style={[styles.toggleTrack, loc.isActive && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, loc.isActive && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(loc.id, loc.name)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger || '#FF6B6B'} />
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.addButton, isDetecting && styles.addButtonDisabled]}
          onPress={detectLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="add-circle-outline" size={22} color={COLORS.white} />
          )}
          <Text style={styles.addButtonText}>
            {isDetecting ? 'Detecting...' : 'Add Current Location'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          When you enter a saved location's radius, the linked blocking profile will automatically activate.
          When you leave, it will deactivate.
        </Text>
      </ScrollView>

      {/* Add Location Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Save Location</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Home, Work, Library"
              placeholderTextColor={COLORS.gray60}
            />

            <Text style={styles.inputLabel}>Radius</Text>
            <View style={styles.radiusRow}>
              {RADIUS_PRESETS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusChip, newRadius === r && styles.radiusChipActive]}
                  onPress={() => setNewRadius(r)}
                >
                  <Text style={[styles.radiusChipText, newRadius === r && styles.radiusChipTextActive]}>
                    {getRadiusLabel(r)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Activate Profile</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileRow}>
              {profiles.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.profileChip, newProfileId === p.id && styles.profileChipActive]}
                  onPress={() => setNewProfileId(p.id)}
                >
                  <Text style={[styles.profileChipText, newProfileId === p.id && styles.profileChipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {detectedCoords && (
              <Text style={styles.coordsText}>
                Location: {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setDetectedCoords(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray40,
    marginBottom: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray40,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.gray60,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  locationMeta: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
  toggleBtn: {
    padding: SPACING.xs,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray80,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    alignSelf: 'flex-end',
  },
  deleteBtnText: {
    fontSize: 12,
    color: COLORS.danger || '#FF6B6B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray60,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray40,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray90,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  radiusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray90,
  },
  radiusChipActive: {
    backgroundColor: COLORS.primary,
  },
  radiusChipText: {
    fontSize: 13,
    color: COLORS.gray40,
  },
  radiusChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  profileRow: {
    marginBottom: SPACING.md,
  },
  profileChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray90,
    marginRight: SPACING.sm,
  },
  profileChipActive: {
    backgroundColor: COLORS.primary,
  },
  profileChipText: {
    fontSize: 13,
    color: COLORS.gray40,
  },
  profileChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  coordsText: {
    fontSize: 11,
    color: COLORS.gray60,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray90,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.gray40,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
