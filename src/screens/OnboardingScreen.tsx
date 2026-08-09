import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { useAppStore } from '../store/StoreContext';
import { setOnboardingComplete } from '../store/localStore';
import { getInstalledApps, InstalledApp } from '../services/appLister';

const PROBLEMS = [
  { id: 'porn', label: 'Porn addiction', icon: 'lock-closed' as const },
  { id: 'social', label: 'Social media', icon: 'chatbubbles' as const },
  { id: 'games', label: 'Games', icon: 'game-controller' as const },
  { id: 'news', label: 'News / doomscrolling', icon: 'newspaper' as const },
  { id: 'video', label: 'Video / streaming', icon: 'play' as const },
  { id: 'dating', label: 'Dating apps', icon: 'heart' as const },
  { id: 'other', label: 'Other distractions', icon: 'apps' as const },
];

const PERMISSIONS = [
  {
    title: 'Usage Access',
    description: 'Detect which app you\'re using to block it',
    icon: 'eye' as const,
  },
  {
    title: 'Display over other apps',
    description: 'Show blocking screen when you try to open a blocked app',
    icon: 'layers' as const,
  },
  {
    title: 'Accessibility Service',
    description: 'Block distracting websites in your browser',
    icon: 'globe' as const,
  },
];

const STEPS = ['welcome', 'problems', 'apps', 'permissions', 'done'] as const;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { addProfile, addBlockedApp } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [allApps, setAllApps] = useState<InstalledApp[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);

  React.useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    const apps = await getInstalledApps();
    setAllApps(apps);
    setAppsLoaded(true);
  }

  const toggleProblem = (id: string) => {
    setSelectedProblems(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleApp = (pkg: string) => {
    setSelectedApps(prev =>
      prev.includes(pkg) ? prev.filter(p => p !== pkg) : [...prev, pkg]
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    const profile = await addProfile('My First Profile');
    for (const pkg of selectedApps) {
      const app = allApps.find(a => a.packageName === pkg);
      if (app) await addBlockedApp(profile.id, pkg, app.appName);
    }
    await addProfile('Default');
    await setOnboardingComplete();
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome': return renderWelcome();
      case 'problems': return renderProblems();
      case 'apps': return renderApps();
      case 'permissions': return renderPermissions();
      case 'done': return renderDone();
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepCenter}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={64} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Welcome to PureBlock</Text>
      <Text style={styles.subtitle}>
        Take control of your screen time. Block distracting apps and websites
        to focus on what matters.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderProblems = () => (
    <View style={styles.stepTop}>
      <Text style={styles.stepLabel}>Step 1 of 3</Text>
      <Text style={styles.title}>What do you struggle with?</Text>
      <Text style={styles.subtitle}>
        Select all that apply. We'll help you set up the right blocks.
      </Text>
      <View style={styles.chipGrid}>
        {PROBLEMS.map(p => {
          const selected = selectedProblems.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleProblem(p.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={selected ? 'checkmark-circle' : p.icon}
                size={20}
                color={selected ? COLORS.primary : COLORS.gray40}
              />
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.spacerMin} />
      <TouchableOpacity
        style={[styles.primaryButton, selectedProblems.length === 0 && styles.disabledButton]}
        onPress={handleNext}
        disabled={selectedProblems.length === 0}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderApps = () => (
    <View style={styles.stepTop}>
      <Text style={styles.stepLabel}>Step 2 of 3</Text>
      <Text style={styles.title}>Pick apps to block</Text>
      <Text style={styles.subtitle}>
        Select the apps you want to restrict. You can always add more later.
      </Text>
      {!appsLoaded ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={32} color={COLORS.gray40} />
          <Text style={styles.loadingText}>Loading apps...</Text>
        </View>
      ) : (
        <ScrollView style={styles.appListScroll} showsVerticalScrollIndicator={false}>
          {allApps.length === 0 ? (
            <Text style={styles.emptyText}>No apps found</Text>
          ) : (
            allApps.map(item => {
              const selected = selectedApps.includes(item.packageName);
              return (
                <TouchableOpacity
                  key={item.packageName}
                  style={styles.appRow}
                  onPress={() => toggleApp(item.packageName)}
                  activeOpacity={0.7}
                >
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{item.appName}</Text>
                    <Text style={styles.appPackage}>{item.packageName}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={24}
                    color={selected ? COLORS.primary : COLORS.gray60}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>
          {selectedApps.length > 0 ? `Block ${selectedApps.length} apps` : 'Skip for now'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderPermissions = () => (
    <View style={styles.stepTop}>
      <Text style={styles.stepLabel}>Step 3 of 3</Text>
      <Text style={styles.title}>Grant permissions</Text>
      <Text style={styles.subtitle}>
        PureBlock needs these permissions to block apps and websites effectively.
        Your data stays on your device.
      </Text>
      {PERMISSIONS.map((perm, i) => (
        <View key={i} style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name={perm.icon} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>{perm.title}</Text>
            <Text style={styles.permissionDesc}>{perm.description}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
        </View>
      ))}
      <Text style={styles.permissionNote}>
        You can grant these later in Settings. Blocking won't work until permissions are granted.
      </Text>
      <View style={styles.spacerMin} />
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderDone = () => (
    <View style={styles.stepCenter}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-done" size={64} color={COLORS.success} />
      </View>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        {selectedApps.length > 0
          ? `${selectedApps.length} apps are ready to be blocked. Start focusing on what matters.`
          : 'You can add apps to block anytime from the Blocking tab.'}
      </Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="folder" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>1 profile created</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="apps" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>{selectedApps.length} apps selected</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
          <Text style={styles.summaryText}>Blocking ready to activate</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
        <Text style={styles.primaryButtonText}>Start Using PureBlock</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button + progress dots */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.gray40} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentStep && styles.dotActive]}
            />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Step content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.md }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray80,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  stepCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  stepTop: {
    alignItems: 'center',
  },
  spacerMin: {
    minHeight: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray40,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    width: '100%',
    marginTop: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gray80,
  },
  chipSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.gray40,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray40,
  },
  appListScroll: {
    width: '100%',
    maxHeight: 300,
    marginBottom: SPACING.md,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
  },
  appPackage: {
    fontSize: 11,
    color: COLORS.gray60,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray60,
    paddingVertical: SPACING.xl,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  permissionDesc: {
    fontSize: 12,
    color: COLORS.gray40,
    marginTop: 2,
  },
  permissionNote: {
    fontSize: 12,
    color: COLORS.gray60,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.gray40,
  },
});
