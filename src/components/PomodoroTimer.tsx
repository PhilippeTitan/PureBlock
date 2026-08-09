import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

type PomodoroPhase = 'focus' | 'break' | 'longBreak' | 'idle';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

interface Props {
  onPhaseChange?: (phase: PomodoroPhase) => void;
}

export default function PomodoroTimer({ onPhaseChange }: Props) {
  const [phase, setPhase] = useState<PomodoroPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = phase === 'focus'
    ? FOCUS_DURATION
    : phase === 'break'
    ? BREAK_DURATION
    : phase === 'longBreak'
    ? LONG_BREAK_DURATION
    : FOCUS_DURATION;

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase]);

  useEffect(() => {
    if (isPaused || phase === 'idle') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handlePhaseEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, phase]);

  const handlePhaseEnd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (phase === 'focus') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
        setPhase('longBreak');
        setTimeLeft(LONG_BREAK_DURATION);
      } else {
        setPhase('break');
        setTimeLeft(BREAK_DURATION);
      }
      setIsPaused(true);
    } else {
      setPhase('focus');
      setTimeLeft(FOCUS_DURATION);
      setIsPaused(true);
    }
  }, [phase, sessionsCompleted]);

  const handleStart = () => {
    if (phase === 'idle') {
      setPhase('focus');
      setTimeLeft(FOCUS_DURATION);
    }
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleToggle = () => {
    if (isPaused) {
      handleStart();
    } else {
      handlePause();
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('idle');
    setTimeLeft(FOCUS_DURATION);
    setIsPaused(true);
    setSessionsCompleted(0);
  };

  const handleSkip = () => {
    handlePhaseEnd();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const phaseColor = phase === 'focus'
    ? COLORS.primary
    : phase === 'break'
    ? COLORS.success
    : phase === 'longBreak'
    ? COLORS.secondary
    : COLORS.primary;

  const filledDots = sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time" size={16} color={phaseColor} />
        <Text style={[styles.headerTitle, { color: phaseColor }]}>Focus time</Text>
        <View style={styles.sessionDots}>
          {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.sessionDot,
                i < filledDots && styles.sessionDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Timer + Button */}
      <View style={styles.timerRow}>
        <View>
          <Text style={styles.timerText}>{timeDisplay}</Text>
          <Text style={styles.sessionCount}>
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: phaseColor }]}
          onPress={handleToggle}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={18}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: 5,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray80,
  },
  sessionDotFilled: {
    backgroundColor: COLORS.primary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerText: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
  sessionCount: {
    fontSize: 11,
    color: COLORS.gray60,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
