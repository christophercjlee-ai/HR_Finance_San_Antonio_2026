// Root Layout
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/lib/auth-context";
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  useEffect(() => { const t = setTimeout(() => SplashScreen.hideAsync(), 500); return () => clearTimeout(t); }, []);
  return (<AuthProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /></Stack></AuthProvider>);
}
