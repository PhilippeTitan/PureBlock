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

  const progress = 1 - timeLeft / totalDuration;

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

  const phaseLabel = phase === 'idle'
    ? 'Ready to focus?'
    : phase === 'focus'
    ? 'Focus Time'
    : phase === 'break'
    ? 'Short Break'
    : 'Long Break';

  const phaseColor = phase === 'focus'
    ? COLORS.primary
    : phase === 'break'
    ? COLORS.success
    : phase === 'longBreak'
    ? COLORS.secondary
    : COLORS.gray40;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="timer" size={18} color={phaseColor} />
        <Text style={[styles.headerTitle, { color: phaseColor }]}>Focus time</Text>
        <View style={styles.sessionDots}>
          {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.sessionDot,
                i < sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK && styles.sessionDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Timer Display */}
      <View style={styles.timerWrap}>
        <View style={styles.timerBackground}>
          <View style={[styles.timerProgress, {
            width: `${progress * 100}%`,
            backgroundColor: phaseColor + '30',
          }]} />
        </View>
        <Text style={styles.timerText}>{timeDisplay}</Text>
        <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={COLORS.gray40} />
        </TouchableOpacity>

        {isPaused ? (
          <TouchableOpacity style={[styles.playButton, { backgroundColor: phaseColor }]} onPress={handleStart}>
            <Ionicons name={phase === 'idle' ? 'play' : 'play'} size={28} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.playButton, { backgroundColor: phaseColor }]} onPress={handlePause}>
            <Ionicons name="pause" size={28} color={COLORS.white} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlButton} onPress={handleSkip}>
          <Ionicons name="play-skip-forward" size={20} color={COLORS.gray40} />
        </TouchableOpacity>
      </View>

      {sessionsCompleted > 0 && (
        <Text style={styles.sessionCount}>
          {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: 6,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray80,
  },
  sessionDotFilled: {
    backgroundColor: COLORS.primary,
  },
  timerWrap: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  timerBackground: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gray80,
    borderRadius: 2,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCount: {
    fontSize: 12,
    color: COLORS.gray40,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
