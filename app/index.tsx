import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/lib/constants";
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return (<View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color={COLORS.primary} /></View>);
  if (session) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/(auth)/login" />;
}
