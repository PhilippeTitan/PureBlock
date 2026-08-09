import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import { useAppStore } from '../store/StoreContext';

interface QuickBlockWidgetProps {
  onPress?: () => void;
}

export default function QuickBlockWidget({ onPress }: QuickBlockWidgetProps) {
  const { isBlocking, toggleBlocking } = useAppStore();

  const handlePress = () => {
    toggleBlocking();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.container, isBlocking && styles.containerActive]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={isBlocking ? 'shield-checkmark' : 'shield-outline'}
          size={24}
          color={COLORS.white}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {isBlocking ? 'Blocking Active' : 'Quick Block'}
        </Text>
        <Text style={styles.subtitle}>
          {isBlocking ? 'Tap to stop' : 'Tap to start blocking now'}
        </Text>
      </View>
      <Ionicons
        name={isBlocking ? 'pause' : 'play'}
        size={20}
        color={COLORS.white}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray90,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  containerActive: {
    backgroundColor: COLORS.success,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
