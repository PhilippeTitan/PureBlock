import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const CODES_KEY = '@pureblock/emergency_codes';
const COOLDOWN_KEY = '@pureblock/emergency_cooldown';
const MAX_CODES = 3;
const COOLDOWN_HOURS = 24;

interface EmergencyCode {
  code: string;
  used: boolean;
  createdAt: string;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function EmergencyUnlock() {
  const [codes, setCodes] = useState<EmergencyCode[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);

  useEffect(() => {
    loadCodes();
    loadCooldown();
  }, []);

  const loadCodes = async () => {
    const raw = await AsyncStorage.getItem(CODES_KEY);
    if (raw) setCodes(JSON.parse(raw));
  };

  const loadCooldown = async () => {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (raw) {
      const end = parseInt(raw, 10);
      if (Date.now() < end) {
        setCooldownEnd(end);
      } else {
        await AsyncStorage.removeItem(COOLDOWN_KEY);
      }
    }
  };

  const saveCodes = async (newCodes: EmergencyCode[]) => {
    await AsyncStorage.setItem(CODES_KEY, JSON.stringify(newCodes));
    setCodes(newCodes);
  };

  const activeCodes = codes.filter(c => !c.used);
  const usedCodes = codes.filter(c => c.used);
  const isOnCooldown = cooldownEnd !== null && Date.now() < cooldownEnd;
  const cooldownHoursLeft = isOnCooldown
    ? Math.ceil(((cooldownEnd! - Date.now()) / 3600000))
    : 0;

  const handleGenerate = async () => {
    if (activeCodes.length >= MAX_CODES) {
      Alert.alert('Limit reached', `You can only have ${MAX_CODES} active codes at a time.`);
      return;
    }
    if (isOnCooldown) {
      Alert.alert('Cooldown', `Wait ${cooldownHoursLeft}h before generating new codes.`);
      return;
    }

    const newCodes: EmergencyCode[] = [
      ...codes,
      { code: generateCode(), used: false, createdAt: new Date().toISOString() },
    ];
    await saveCodes(newCodes);

    if (newCodes.filter(c => !c.used).length >= MAX_CODES) {
      const cooldownEnd = Date.now() + COOLDOWN_HOURS * 3600000;
      await AsyncStorage.setItem(COOLDOWN_KEY, cooldownEnd.toString());
      setCooldownEnd(cooldownEnd);
    }
  };

  const handleReveal = (code: string) => {
    Alert.alert(
      'Emergency Code',
      `Your code: ${code}\n\nThis code can be used once to bypass blocking in an emergency. Keep it safe.`,
      [{ text: 'Copy & Close', onPress: () => {} }]
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.highlightRow} onPress={() => setShowModal(true)}>
        <View style={styles.highlightHeader}>
          <Ionicons name="key" size={18} color={COLORS.warning} />
          <Text style={styles.highlightTitle}>Emergency unlock</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {activeCodes.length} code{activeCodes.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.highlightDescription}>
          One-time bypass codes for real emergencies. {COOLDOWN_HOURS}h cooldown once used up.
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Unlock Codes</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Generate one-time-use codes to bypass blocking in emergencies. Each code works once.
              Max {MAX_CODES} active codes. {COOLDOWN_HOURS}h cooldown after generating all codes.
            </Text>

            {/* Active Codes */}
            {activeCodes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Codes</Text>
                {activeCodes.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.codeCard}
                    onPress={() => handleReveal(c.code)}
                  >
                    <View style={styles.codeLeft}>
                      <Ionicons name="key" size={18} color={COLORS.warning} />
                      <Text style={styles.codeText}>{c.code}</Text>
                    </View>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>Tap to reveal</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Used Codes */}
            {usedCodes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Used Codes</Text>
                {usedCodes.slice(-3).reverse().map(c => (
                  <View key={c.code} style={[styles.codeCard, styles.codeCardUsed]}>
                    <View style={styles.codeLeft}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.gray60} />
                      <Text style={[styles.codeText, styles.codeTextUsed]}>{c.code}</Text>
                    </View>
                    <Text style={styles.usedLabel}>Used</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                (activeCodes.length >= MAX_CODES || isOnCooldown) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={activeCodes.length >= MAX_CODES || isOnCooldown}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
              <Text style={styles.generateText}>
                {isOnCooldown
                  ? `Cooldown: ${cooldownHoursLeft}h remaining`
                  : activeCodes.length >= MAX_CODES
                  ? 'Max codes reached'
                  : 'Generate New Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  highlightRow: {
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1,
    borderColor: COLORS.primary + '35',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  highlightTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  countBadge: {
    backgroundColor: COLORS.warning + '25',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.warning,
  },
  highlightDescription: {
    fontSize: 11,
    color: COLORS.gray40,
    lineHeight: 16,
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
    maxHeight: '85%',
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
  modalDesc: {
    fontSize: 13,
    color: COLORS.gray40,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray40,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  codeCardUsed: {
    opacity: 0.6,
  },
  codeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  codeTextUsed: {
    color: COLORS.gray60,
  },
  codeBadge: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  codeBadgeText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '500',
  },
  usedLabel: {
    fontSize: 12,
    color: COLORS.gray60,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.gray80,
  },
  generateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
