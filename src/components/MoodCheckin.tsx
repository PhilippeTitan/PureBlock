import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const MOOD_KEY = '@pureblock/mood_history';
const LAST_MOOD_KEY = '@pureblock/last_mood_checkin';

const MOODS = [
  { emoji: '😫', label: 'Terrible', color: COLORS.error },
  { emoji: '😔', label: 'Bad', color: COLORS.warning },
  { emoji: '😐', label: 'Okay', color: COLORS.gray40 },
  { emoji: '🙂', label: 'Good', color: COLORS.info },
  { emoji: '🔥', label: 'Great', color: COLORS.success },
];

interface MoodEntry {
  mood: number;
  note: string;
  timestamp: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  context?: 'before' | 'after';
}

export default function MoodCheckin({ visible, onClose, context = 'before' }: Props) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    if (visible) loadHistory();
  }, [visible]);

  const loadHistory = async () => {
    const raw = await AsyncStorage.getItem(MOOD_KEY);
    if (raw) setHistory(JSON.parse(raw));
  };

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    const entry: MoodEntry = {
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...history, entry];
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(newHistory));
    await AsyncStorage.setItem(LAST_MOOD_KEY, new Date().toISOString());
    setHistory(newHistory);
    setSelectedMood(null);
    setNote('');
    onClose();
  };

  const getStreak = () => {
    if (history.length === 0) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStr = day.toDateString();
      const hasEntry = history.some(e => new Date(e.timestamp).toDateString() === dayStr);
      if (hasEntry) streak++;
      else break;
    }
    return streak;
  };

  const getAvgMood = () => {
    if (history.length === 0) return null;
    const recent = history.slice(-7);
    const avg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    return avg;
  };

  const streak = getStreak();
  const avgMood = getAvgMood();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {context === 'before' ? 'How are you feeling?' : 'How was your session?'}
          </Text>
          <Text style={styles.subtitle}>
            {context === 'before'
              ? 'Check in before you start blocking'
              : 'Reflect on your focus time'}
          </Text>

          {/* Mood Selection */}
          <View style={styles.moodRow}>
            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.moodButton,
                  selectedMood === i && styles.moodButtonSelected,
                  selectedMood === i && { borderColor: m.color },
                ]}
                onPress={() => setSelectedMood(i)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === i && { color: m.color },
                ]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            placeholderTextColor={COLORS.gray60}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />

          {/* Stats */}
          {(streak > 0 || avgMood !== null) && (
            <View style={styles.statsRow}>
              {streak > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={16} color={COLORS.accent} />
                  <Text style={styles.statText}>{streak} day streak</Text>
                </View>
              )}
              {avgMood !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>{MOODS[Math.round(avgMood)].emoji}</Text>
                  <Text style={styles.statText}>Avg: {MOODS[Math.round(avgMood)].label}</Text>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipButton} onPress={onClose}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, selectedMood === null && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={selectedMood === null}
            >
              <Text style={styles.submitText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export async function shouldShowMoodCheckin(): Promise<boolean> {
  const lastRaw = await AsyncStorage.getItem(LAST_MOOD_KEY);
  if (!lastRaw) return true;
  const last = new Date(lastRaw);
  const now = new Date();
  const hoursSince = (now.getTime() - last.getTime()) / 3600000;
  return hoursSince >= 12;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.gray95,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray40,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: COLORS.gray80,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: 11,
    color: COLORS.gray40,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray40,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  skipText: {
    fontSize: 15,
    color: COLORS.gray40,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  submitDisabled: {
    backgroundColor: COLORS.gray80,
  },
  submitText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
  },
});
