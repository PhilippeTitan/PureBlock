import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import BlockingScreen from './src/screens/BlockingScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfilesScreen from './src/screens/ProfilesScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import BlockerScreen from './src/screens/BlockerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import WebsiteBlockingScreen from './src/screens/WebsiteBlockingScreen';
import LocationProfilesScreen from './src/screens/LocationProfilesScreen';
import { StoreProvider } from './src/store/StoreContext';
import { COLORS } from './src/theme';
import { isOnboardingComplete } from './src/store/localStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Blocking') {
            iconName = focused ? 'lock-closed' : 'lock-closed-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray40,
        tabBarStyle: {
          backgroundColor: COLORS.gray90,
          borderTopColor: COLORS.gray80,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Blocking" component={BlockingScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboardingComplete().then(done => setOnboardingDone(done));
  }, []);

  if (onboardingDone === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <StoreProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {!onboardingDone ? (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Main"
                  component={TabNavigator}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Profiles"
                  component={ProfilesScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Schedule"
                  component={ScheduleScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Websites"
                  component={WebsiteBlockingScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="LocationProfiles"
                  component={LocationProfilesScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Blocker"
                  component={BlockerScreen}
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
