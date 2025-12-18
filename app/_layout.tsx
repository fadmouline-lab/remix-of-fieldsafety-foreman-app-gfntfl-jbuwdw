
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "#2196F3",
      background: "#F5F5F5",
      card: "#FFFFFF",
      text: "#333333",
      border: "#E0E0E0",
      notification: "#F44336",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "#2196F3",
      background: "#1A1A1A",
      card: "#2A2A2A",
      text: "#FFFFFF",
      border: "#444444",
      notification: "#F44336",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <LanguageProvider>
            <ActivityLogProvider>
              <WidgetProvider>
                <GestureHandlerRootView>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="forgot-password" />
                    <Stack.Screen name="select-project" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="pre-task-modal" />
                    <Stack.Screen name="pre-task-duplicate" />
                    <Stack.Screen name="pre-task-select-tasks" />
                    <Stack.Screen name="pre-task-select-workers" />
                    <Stack.Screen name="pre-task-summary" />
                    <Stack.Screen name="daily-activity-log-1" />
                    <Stack.Screen name="daily-activity-log-2" />
                    <Stack.Screen name="daily-activity-log-3" />
                    <Stack.Screen name="time-cards-1" />
                    <Stack.Screen name="time-cards-2" />
                    <Stack.Screen name="hauling-dumpsters-1" />
                    <Stack.Screen name="hauling-dumpsters-2" />
                    <Stack.Screen name="extra-work-ticket-1" />
                    <Stack.Screen name="extra-work-ticket-2" />
                    <Stack.Screen name="extra-work-ticket-3" />
                    <Stack.Screen name="extra-work-ticket-4" />
                    <Stack.Screen name="incident-report-1" />
                    <Stack.Screen name="incident-report-2" />
                    <Stack.Screen name="incident-report-3" />
                    <Stack.Screen name="incident-report-4" />
                    <Stack.Screen name="near-miss-report-1" />
                    <Stack.Screen name="near-miss-report-2" />
                    <Stack.Screen name="near-miss-report-3" />
                    <Stack.Screen name="observation-report-1" />
                    <Stack.Screen name="observation-report-2" />
                    <Stack.Screen name="observation-report-3" />
                    <Stack.Screen name="equipment-inspection-1" />
                    <Stack.Screen name="equipment-inspection-2" />
                    <Stack.Screen name="equipment-inspection-3" />
                    <Stack.Screen
                      name="modal"
                      options={{
                        presentation: "modal",
                        title: "Standard Modal",
                        headerShown: true,
                      }}
                    />
                    <Stack.Screen
                      name="formsheet"
                      options={{
                        presentation: "formSheet",
                        title: "Form Sheet Modal",
                        headerShown: true,
                        sheetGrabberVisible: true,
                        sheetAllowedDetents: [0.5, 0.8, 1.0],
                        sheetCornerRadius: 20,
                      }}
                    />
                    <Stack.Screen
                      name="transparent-modal"
                      options={{
                        presentation: "transparentModal",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen name="account-not-setup" />
                  </Stack>
                  <SystemBars style={"auto"} />
                </GestureHandlerRootView>
              </WidgetProvider>
            </ActivityLogProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
