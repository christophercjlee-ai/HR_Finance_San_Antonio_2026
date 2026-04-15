import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/constants";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/EmptyState";
import { Search, Users, User, Mail } from "lucide-react-native";
import type { Participant } from "@/lib/types";

export default function ParticipantsScreen() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchParticipants(); }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("participants").select("*").order("full_name", { ascending: true });
    if (!error && data) { setParticipants(data as Participant[]); }
    setLoading(false);
  };

  const filtered = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) ||
      (p.department?.toLowerCase() || "").includes(q) || (p.title?.toLowerCase() || "").includes(q);
  });

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center">
      <View className="w-12 h-12 rounded-full bg-graham-blue items-center justify-center mr-4">
        <Text className="text-white font-bold text-lg">
          {item.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-graham-dark">{item.full_name}</Text>
        {item.title && (<Text className="text-sm text-graham-muted">{item.title}</Text>)}
        <View className="flex-row items-center mt-1">
          <Mail size={12} color={COLORS.muted} />
          <Text className="text-xs text-graham-muted ml-1">{item.email}</Text>
        </View>
      </View>
      {item.department && (
        <View className={`rounded-full px-2.5 py-1 ${item.department === "HR" ? "bg-purple-100" : "bg-blue-100"}`}>
          <Text className={`text-xs font-semibold ${item.department === "HR" ? "text-purple-600" : "text-blue-600"}`}>{item.department}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Participants" subtitle={`${participants.length} attendees`} />
      <View className="px-5 py-3">
        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center border border-gray-200">
          <Search size={18} color={COLORS.muted} />
          <TextInput className="flex-1 ml-3 text-base text-graham-dark" placeholder="Search by name, email, or department..."
            placeholderTextColor={COLORS.muted} value={searchQuery} onChangeText={setSearchQuery} autoCorrect={false} />
        </View>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={renderParticipant}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={<EmptyState icon={Users} title="No Participants Found"
            message={searchQuery ? "No results match your search." : "Participant data will be imported by administrators."} />} />
      )}
    </View>
  );
}
