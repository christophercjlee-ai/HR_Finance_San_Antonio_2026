import { View, Text } from "react-native";
import { COLORS } from "@/lib/constants";
import type { AgendaFunction } from "@/lib/types";

interface FunctionBadgeProps {
  func: AgendaFunction;
  small?: boolean;
}

export function FunctionBadge({ func, small }: FunctionBadgeProps) {
  const isHR = func === "HR";
  const bgColor = isHR ? "#EDE9FE" : "#DBEAFE";
  const textColor = isHR ? COLORS.hrBadge : COLORS.financeBadge;

  return (
    <View
      style={{ backgroundColor: bgColor }}
      className={`rounded-full ${small ? "px-2 py-0.5" : "px-3 py-1"}`}
    >
      <Text
        style={{ color: textColor, fontSize: small ? 10 : 12 }}
        className="font-bold"
      >
        {func}
      </Text>
    </View>
  );
}
