import { FontFamily } from "@/util/FontFamily";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [FontFamily.bricolage]: require("../assets/fonts/Bricolage.ttf"),
    [FontFamily.bricolageBold]: require("../assets/fonts/BricolageBold.ttf"),
  });

  if (!fontsLoaded) {
    SplashScreen.hideAsync();
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ title: "Mate AI" }} />
        <Stack.Screen
          name="overdue"
          options={{ title: "Overdue invoices", headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, title: "Profile" }}
        />
        <Stack.Screen
          name="add-expense"
          options={{ presentation: "modal", headerTitle: "Add Expense" }}
        />

        <Stack.Screen name="expenses" options={{ headerShown: false }} />

        <Stack.Screen
          name="summary"
          options={{ title: "Invoice summary", presentation: "modal" }}
        />

        <Stack.Screen
          name="settings"
          options={{ title: "Profile settings", presentation: "modal" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
