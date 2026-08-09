// expo-notifications requires a development build, not Expo Go (removed in SDK 53)
// All imports are lazy to avoid crash on import in Expo Go

const QUOTES = [
  "Every moment of resistance is a victory.",
  "You are stronger than your urges.",
  "Progress, not perfection.",
  "Your future self will thank you.",
  "One day at a time.",
  "You chose this path for a reason.",
  "Discipline is choosing between what you want now and what you want most.",
  "The only way out is through.",
  "You've survived 100% of your worst days.",
  "Small steps lead to big changes.",
  "Your brain is rewiring itself. Keep going.",
  "Freedom is on the other side of discipline.",
  "You don't have to be perfect, just consistent.",
  "This urge will pass. Stay strong.",
  "Every day you resist is a day you take back control.",
  "You are not your habits. You can change.",
  "The discomfort of discipline is nothing compared to the discomfort of regret.",
  "You are building something beautiful — a life of freedom.",
  "Cravings are temporary. Pride is permanent.",
  "You are worth more than a quick fix.",
  "Each no is a yes to your future.",
  "Your willpower is a muscle. It gets stronger with use.",
  "You are rewriting your story.",
  "The best time to start was yesterday. The next best time is now.",
  "Recovery is not linear. Every setback is a setup for a comeback.",
  "You are not alone in this journey.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  "The secret of getting ahead is getting started.",
  "You are capable of amazing things.",
  "Your struggle today is building the strength you need for tomorrow.",
];

let notificationsAvailable: boolean | null = null;
let handlerSet = false;

async function getNotifications() {
  try {
    const mod = await import('expo-notifications');
    return mod;
  } catch {
    return null;
  }
}

async function ensureHandler() {
  if (handlerSet) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerSet = true;
  } catch {}
}

async function isNotificationsAvailable(): Promise<boolean> {
  if (notificationsAvailable !== null) return notificationsAvailable;
  const Notifications = await getNotifications();
  if (!Notifications) {
    notificationsAvailable = false;
    return false;
  }
  try {
    await Notifications.getPermissionsAsync();
    notificationsAvailable = true;
  } catch {
    notificationsAvailable = false;
  }
  return notificationsAvailable;
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyMotivation(): Promise<string | null> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    await ensureHandler();
    await Notifications.cancelAllScheduledNotificationsAsync();

    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Stay Strong',
        body: quote,
        data: { type: 'daily_motivation' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function scheduleStreakReminder(days: number): Promise<string | null> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const messages: Record<number, string> = {
      3: "3 days clean! The hardest part is over. Keep going!",
      7: "One week strong! You're rewiring your brain.",
      14: "Two weeks! Your discipline is inspiring.",
      30: "One month! You're a completely different person now.",
      60: "60 days! Most people never make it this far.",
      90: "90 days! Scientifically proven: your brain has changed.",
    };

    const message = messages[days];
    if (!message) return null;

    await ensureHandler();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${days}-Day Milestone!`,
        body: message,
        data: { type: 'streak_reminder', days },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function getScheduledNotifications(): Promise<any[]> {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}
