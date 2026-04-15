import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarDays, Users, Camera, Bell, MessageSquare } from "lucide-react-native";
import { GrahamLogo } from "@/components/GrahamLogo";
import { CONFERENCE, WELCOME_MESSAGES, COLORS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const quickActions = [
    { icon: CalendarDays, label: "Agenda", color: COLORS.primary, route: "/(tabs)/agenda" as const },
    { icon: Users, label: "People", color: COLORS.green, route: "/(tabs)/participants" as const },
    { icon: Camera, label: "Photos", color: COLORS.accent, route: "/(tabs)/photos" as const },
    { icon: Bell, label: "Alerts", color: "#8B5CF6", route: "/(tabs)/notifications" as const },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingTop: insets.top + 16 }} className="bg-white px-6 pb-8 rounded-b-3xl shadow-sm">
        <View className="items-center mb-6"><GrahamLogo variant="full" width={280} /></View>
        <Text className="text-2xl font-bold text-graham-dark text-center mb-2">{CONFERENCE.title}</Text>
        <View className="bg-blue-50 rounded-xl px-5 py-3 mt-2">
          <Text className="text-base font-semibold text-graham-blue text-center">{CONFERENCE.dateRangeLong}</Text>
        </View>
        {user && (<Text className="text-sm text-graham-muted text-center mt-4">Welcome, {user.full_name || user.email}</Text>)}
      </View>

      <View className="px-5 mt-6">
        <Text className="text-lg font-bold text-graham-dark mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} onPress={() => router.push(action.route)}
              className="bg-white rounded-2xl p-4 mb-3 items-center shadow-sm border border-gray-100" style={{ width: "48%" }}>
              <View style={{ backgroundColor: action.color + "15" }} className="w-12 h-12 rounded-full items-center justify-center mb-2">
                <action.icon size={22} color={action.color} />
              </View>
              <Text className="text-sm font-semibold text-graham-dark">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-5 mt-4">
        <Text className="text-lg font-bold text-graham-dark mb-3">Messages from Leadership</Text>
        {[WELCOME_MESSAGES.executive1, WELCOME_MESSAGES.executive2].map((exec, index) => (
          <View key={index} className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-graham-blue items-center justify-center mr-3">
                <MessageSquare size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text className="font-bold text-graham-dark">{exec.name}</Text>
                <Text className="text-xs text-graham-muted">{exec.title}</Text>
              </View>
            </View>
            <Text className="text-sm text-graham-dark leading-5">"{exec.message}"</Text>
          </View>
        ))}
      </View>

      <View className="px-5 mt-4">
        <View className="bg-green-50 rounded-2xl p-5 border border-green-100">
          <Text className="text-base font-bold text-graham-dark mb-1">About This Conference</Text>
          <Text className="text-sm text-graham-muted leading-5">
            Join ~{CONFERENCE.participantCount} colleagues from HR and Finance for three days of strategic sessions, workshops, and networking. Check the Agenda tab for the latest schedule.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
