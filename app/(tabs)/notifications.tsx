import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/EmptyState";
import { formatRelativeTime } from "@/lib/date-helpers";
import { Bell, BellOff, Megaphone, Users, DollarSign } from "lucide-react-native";
import type { AppNotification } from "@/lib/types";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: notifs } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    const { data: reads } = await supabase.from("notification_reads").select("notification_id").eq("user_id", user.id);
    if (notifs) setNotifications(notifs as AppNotification[]);
    if (reads) setReadIds(new Set(reads.map((r) => r.notification_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const channel = supabase.channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user || readIds.has(notificationId)) return;
    await supabase.from("notification_reads").insert({ user_id: user.id, notification_id: notificationId });
    setReadIds((prev) => new Set([...prev, notificationId]));
  };

  const getTargetIcon = (target: string) => {
    switch (target) { case "finance": return DollarSign; case "hr": return Users; default: return Megaphone; }
  };

  const getTargetLabel = (target: string) => {
    switch (target) { case "finance": return "Finance"; case "hr": return "HR"; default: return "Everyone"; }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const isRead = readIds.has(item.id);
    const TargetIcon = getTargetIcon(item.target);
    return (
      <TouchableOpacity onPress={() => markAsRead(item.id)}
        className={`rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 ${isRead ? "bg-gray-50" : "bg-white"}`}>
        <View className="flex-row items-start">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isRead ? "bg-gray-200" : "bg-blue-100"}`}>
            <TargetIcon size={18} color={isRead ? COLORS.muted : COLORS.primary} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className={`text-base font-bold ${isRead ? "text-graham-muted" : "text-graham-dark"}`}>{item.title}</Text>
              {!isRead && (<View className="w-2.5 h-2.5 rounded-full bg-graham-blue" />)}
            </View>
            <Text className={`text-sm leading-5 mb-2 ${isRead ? "text-gray-400" : "text-graham-muted"}`}>{item.body}</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-gray-100 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-graham-muted">{getTargetLabel(item.target)}</Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400">{formatRelativeTime(item.created_at)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"} />
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList data={notifications} keyExtractor={(item) => item.id} renderItem={renderNotification}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
          ListEmptyComponent={<EmptyState icon={BellOff} title="No Notifications"
            message="You're all caught up. Notifications from conference organizers will appear here." />} />
      )}
    </View>
  );
}
