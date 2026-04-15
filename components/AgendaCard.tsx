// =============================================================================
// Agenda Card
// =============================================================================

import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import * as Calendar from "expo-calendar";
import { MapPin, CalendarPlus } from "lucide-react-native";
import { COLORS, CONFERENCE } from "@/lib/constants";
import { formatAgendaTime } from "@/lib/date-helpers";
import { FunctionBadge } from "./FunctionBadge";
import type { AgendaItem } from "@/lib/types";

interface AgendaCardProps {
  item: AgendaItem;
}

export function AgendaCard({ item }: AgendaCardProps) {
  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Calendar access is needed to add events."
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      let calendarId: string;

      if (Platform.OS === "ios") {
        const defaultCalendar = calendars.find(
          (c) => c.allowsModifications && c.source?.type === "local"
        );
        calendarId = defaultCalendar?.id || calendars[0]?.id;
      } else {
        const primaryCalendar = calendars.find(
          (c) => c.isPrimary && c.allowsModifications
        );
        calendarId =
          primaryCalendar?.id ||
          calendars.find((c) => c.allowsModifications)?.id ||
          calendars[0]?.id;
      }

      if (!calendarId) {
        Alert.alert("Error", "No writable calendar found on this device.");
        return;
      }

      await Calendar.createEventAsync(calendarId, {
        title: `[${item.function}] ${item.title}`,
        startDate: new Date(item.start_time),
        endDate: new Date(item.end_time),
        location: item.location,
        notes: `${CONFERENCE.title}\n${item.function} track`,
        timeZone: "America/New_York",
      });

      Alert.alert("Added!", `"${item.title}" has been added to your calendar.`);
    } catch (error) {
      Alert.alert("Error", "Could not add event to calendar.");
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <FunctionBadge func={item.function} />
        <TouchableOpacity
          onPress={handleAddToCalendar}
          className="flex-row items-center bg-blue-50 rounded-lg px-3 py-1.5"
        >
          <CalendarPlus size={14} color={COLORS.primary} />
          <Text className="text-xs font-semibold text-graham-blue ml-1">
            Add to Calendar
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-base font-bold text-graham-dark mb-1.5">
        {item.title}
      </Text>

      <Text className="text-sm text-graham-muted mb-1">
        {formatAgendaTime(item.start_time, item.end_time)}
      </Text>

      {item.location ? (
        <View className="flex-row items-center">
          <MapPin size={14} color={COLORS.muted} />
          <Text className="text-sm text-graham-muted ml-1">
            {item.location}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
