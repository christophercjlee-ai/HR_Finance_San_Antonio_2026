import { useEffect, useState, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { CONFERENCE, COLORS } from "@/lib/constants";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AgendaCard } from "@/components/AgendaCard";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";
import { CalendarDays } from "lucide-react-native";
import type { AgendaItem, AgendaFunction } from "@/lib/types";

const FILTERS = ["All", "HR", "Finance"];

export default function AgendaScreen() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("agenda_items")
      .select("*")
      .order("start_time", { ascending: true });

    if (filter !== "All") {
      query = query.eq("function", filter as AgendaFunction);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data as AgendaItem[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  useEffect(() => {
    const channel = supabase
      .channel("agenda-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agenda_items" }, () => { fetchAgenda(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAgenda]);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Agenda" subtitle={CONFERENCE.dateRangeDisplay} />
      <View className="bg-blue-50 mx-5 mt-3 rounded-xl px-4 py-2.5">
        <Text className="text-sm font-semibold text-graham-blue text-center">{CONFERENCE.dateRangeLong}</Text>
      </View>
      <FilterBar filters={FILTERS} active={filter} onSelect={setFilter} />
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AgendaCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={<EmptyState icon={CalendarDays} title="No Sessions Yet" message="The agenda is being finalized. Check back soon for updates!" />}
        />
      )}
    </View>
  );
}
