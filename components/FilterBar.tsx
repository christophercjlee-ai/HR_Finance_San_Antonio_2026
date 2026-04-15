import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { COLORS } from "@/lib/constants";

interface FilterBarProps {
  filters: string[];
  active: string;
  onSelect: (filter: string) => void;
}

export function FilterBar({ filters, active, onSelect }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-5 py-3"
    >
      {filters.map((filter) => {
        const isActive = filter === active;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onSelect(filter)}
            style={{
              backgroundColor: isActive ? COLORS.primary : "#F3F4F6",
            }}
            className="rounded-full px-5 py-2 mr-2"
          >
            <Text
              style={{
                color: isActive ? "#FFFFFF" : COLORS.muted,
              }}
              className="font-semibold text-sm"
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
