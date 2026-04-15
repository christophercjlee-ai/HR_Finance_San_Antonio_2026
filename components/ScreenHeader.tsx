import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GrahamLogo } from "./GrahamLogo";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="bg-white px-5 pb-4 border-b border-gray-100"
    >
      <View className="items-center mb-3">
        <GrahamLogo variant="swirl" width={32} />
      </View>
      <Text className="text-2xl font-bold text-graham-dark text-center">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-graham-muted text-center mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
