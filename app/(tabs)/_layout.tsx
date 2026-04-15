import { Tabs, Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/lib/constants";
import { ActivityIndicator, View } from "react-native";
import { Home, CalendarDays, Users, Camera, Bell, Settings } from "lucide-react-native";

export default function TabLayout() {
  const { session, user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF", borderTopColor: "#E5E7EB", borderTopWidth: 1,
          paddingBottom: 8, paddingTop: 8, height: 88,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="agenda" options={{ title: "Agenda", tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} /> }} />
      <Tabs.Screen name="participants" options={{ title: "People", tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tabs.Screen name="photos" options={{ title: "Photos", tabBarIcon: ({ color, size }) => <Camera size={size} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <Bell size={size} color={color} /> }} />
      <Tabs.Screen name="admin" options={{ title: "Admin", tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />, href: isAdmin ? "/(tabs)/admin" : null }} />
    </Tabs>
  );
}
