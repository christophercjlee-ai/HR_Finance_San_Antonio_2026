import { View, Text } from "react-native";
import { COLORS } from "@/lib/constants";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Icon size={28} color={COLORS.muted} />
      </View>
      <Text className="text-lg font-bold text-graham-dark text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-graham-muted text-center leading-5">
        {message}
      </Text>
    </View>
  );
}
