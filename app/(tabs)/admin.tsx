// =============================================================================
// Admin Screen – Hub for coordinators to manage the conference
// Features: Agenda CRUD + CSV, Notifications broadcast, Participants CSV,
//           Photo approval, and simple analytics.
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { COLORS, CONFERENCE_DAYS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FunctionBadge } from "@/components/FunctionBadge";
import { formatAgendaTime } from "@/lib/date-helpers";
import {
  CalendarDays,
  Megaphone,
  Users,
  Camera,
  BarChart3,
  Plus,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
} from "lucide-react-native";
import type {
  AgendaItem,
  Photo,
  AgendaFunction,
  NotificationTarget,
} from "@/lib/types";

// ── Section navigation ──────────────────────────────────────────────────────
type AdminSection =
  | "menu"
  | "agenda"
  | "notifications"
  | "participants"
  | "photos"
  | "analytics";

export default function AdminScreen() {
  const { user } = useAuth();
  const [section, setSection] = useState<AdminSection>("menu");

  const menuItems = [
    {
      id: "agenda" as AdminSection,
      icon: CalendarDays,
      label: "Manage Agenda",
      desc: "Add, edit, delete sessions & CSV import",
      color: COLORS.primary,
    },
    {
      id: "notifications" as AdminSection,
      icon: Megaphone,
      label: "Broadcast Notifications",
      desc: "Send announcements to attendees",
      color: COLORS.accent,
    },
    {
      id: "participants" as AdminSection,
      icon: Users,
      label: "Manage Participants",
      desc: "Import attendee list via CSV",
      color: COLORS.green,
    },
    {
      id: "photos" as AdminSection,
      icon: Camera,
      label: "Photo Approval",
      desc: "Approve or reject uploaded photos",
      color: "#8B5CF6",
    },
    {
      id: "analytics" as AdminSection,
      icon: BarChart3,
      label: "Analytics",
      desc: "Photo count, active users, and more",
      color: "#EC4899",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Admin" subtitle="Conference management" />

      {section === "menu" ? (
        <ScrollView
          className="px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSection(item.id)}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View
                style={{ backgroundColor: item.color + "15" }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <item.icon size={22} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-graham-dark">
                  {item.label}
                </Text>
                <Text className="text-sm text-graham-muted">{item.desc}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => setSection("menu")}
            className="flex-row items-center px-5 py-3"
          >
            <Text className="text-graham-blue font-semibold">← Back</Text>
          </TouchableOpacity>

          {section === "agenda" && <AgendaManagement />}
          {section === "notifications" && <NotificationBroadcast />}
          {section === "participants" && <ParticipantManagement />}
          {section === "photos" && <PhotoApproval />}
          {section === "analytics" && <AnalyticsDashboard />}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// AGENDA MANAGEMENT
// =============================================================================
function AgendaManagement() {
  const { user } = useAuth();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);

  // Form state
  const [formFunc, setFormFunc] = useState<AgendaFunction>("HR");
  const [formTitle, setFormTitle] = useState("");
  const [formDay, setFormDay] = useState(CONFERENCE_DAYS[0].value);
  const [formStartHour, setFormStartHour] = useState("09");
  const [formStartMin, setFormStartMin] = useState("00");
  const [formEndHour, setFormEndHour] = useState("10");
  const [formEndMin, setFormEndMin] = useState("00");
  const [formLocation, setFormLocation] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("agenda_items")
      .select("*")
      .order("start_time");
    if (data) setItems(data as AgendaItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setFormFunc("HR");
    setFormTitle("");
    setFormDay(CONFERENCE_DAYS[0].value);
    setFormStartHour("09");
    setFormStartMin("00");
    setFormEndHour("10");
    setFormEndMin("00");
    setFormLocation("");
    setEditingItem(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: AgendaItem) => {
    setEditingItem(item);
    setFormFunc(item.function);
    setFormTitle(item.title);
    // Parse existing times
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const dayStr = start.toISOString().split("T")[0];
    const matchingDay = CONFERENCE_DAYS.find((d) => d.value === dayStr);
    setFormDay(matchingDay?.value || CONFERENCE_DAYS[0].value);
    setFormStartHour(start.getHours().toString().padStart(2, "0"));
    setFormStartMin(start.getMinutes().toString().padStart(2, "0"));
    setFormEndHour(end.getHours().toString().padStart(2, "0"));
    setFormEndMin(end.getMinutes().toString().padStart(2, "0"));
    setFormLocation(item.location);
    setShowForm(true);
  };

  const saveItem = async () => {
    if (!formTitle.trim()) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    const startTime = `${formDay}T${formStartHour}:${formStartMin}:00`;
    const endTime = `${formDay}T${formEndHour}:${formEndMin}:00`;

    const payload = {
      function: formFunc,
      title: formTitle.trim(),
      start_time: startTime,
      end_time: endTime,
      location: formLocation.trim(),
      created_by: user?.id,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("agenda_items")
        .update(payload)
        .eq("id", editingItem.id);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("agenda_items").insert(payload);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
    }

    setShowForm(false);
    resetForm();
    fetchItems();
  };

  const deleteItem = (item: AgendaItem) => {
    Alert.alert("Delete Session", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("agenda_items").delete().eq("id", item.id);
          fetchItems();
        },
      },
    ]);
  };

  // ── CSV Import ──────────────────────────────────────────────────────────
  const importCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as Record<string, string>[];
          let imported = 0;

          for (const row of rows) {
            // Expected CSV columns: function,title,start_time,end_time,location
            const func = row.function?.trim();
            const title = row.title?.trim();
            const startTime = row.start_time?.trim();
            const endTime = row.end_time?.trim();
            const location = row.location?.trim() || "";

            if (!func || !title || !startTime || !endTime) continue;
            if (func !== "HR" && func !== "Finance") continue;

            const { error } = await supabase.from("agenda_items").insert({
              function: func as AgendaFunction,
              title,
              start_time: startTime,
              end_time: endTime,
              location,
              created_by: user?.id,
            });

            if (!error) imported++;
          }

          Alert.alert("Import Complete", `${imported} agenda items imported.`);
          fetchItems();
        },
        error: () => {
          Alert.alert("Error", "Could not parse the CSV file.");
        },
      });
    } catch {
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  return (
    <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-lg font-bold text-graham-dark mb-3">
        Agenda Management
      </Text>

      {/* Action buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={openAddForm}
          className="flex-1 bg-graham-blue rounded-xl py-3 flex-row items-center justify-center"
        >
          <Plus size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={importCSV}
          className="flex-1 bg-graham-green rounded-xl py-3 flex-row items-center justify-center"
        >
          <Upload size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Import CSV</Text>
        </TouchableOpacity>
      </View>

      {/* CSV format instructions */}
      <View className="bg-blue-50 rounded-xl p-4 mb-4">
        <Text className="text-xs font-bold text-graham-blue mb-1">
          CSV Format:
        </Text>
        <Text className="text-xs text-graham-blue font-mono">
          function,title,start_time,end_time,location{"\n"}
          HR,Welcome,2026-04-21T09:00:00,2026-04-21T09:30:00,Ballroom
        </Text>
      </View>

      {/* Agenda items list */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <FunctionBadge func={item.function} small />
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => openEditForm(item)}>
                  <Edit3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(item)}>
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-sm font-bold text-graham-dark">
              {item.title}
            </Text>
            <Text className="text-xs text-graham-muted mt-1">
              {formatAgendaTime(item.start_time, item.end_time)}
            </Text>
            {item.location ? (
              <Text className="text-xs text-graham-muted">{item.location}</Text>
            ) : null}
          </View>
        ))
      )}

      {/* Add/Edit Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-graham-dark">
                {editingItem ? "Edit Session" : "Add Session"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <X size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            {/* Function toggle */}
            <Text className="text-sm font-semibold text-graham-dark mb-2">
              Function
            </Text>
            <View className="flex-row gap-3 mb-4">
              {(["HR", "Finance"] as AgendaFunction[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFormFunc(f)}
                  className={`flex-1 rounded-xl py-3 items-center border ${
                    formFunc === f
                      ? "bg-graham-blue border-graham-blue"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      formFunc === f ? "text-white" : "text-graham-muted"
                    }`}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text className="text-sm font-semibold text-graham-dark mb-2">
              Title
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-graham-dark mb-4 border border-gray-200"
              placeholder="Session title"
              placeholderTextColor={COLORS.muted}
              value={formTitle}
              onChangeText={setFormTitle}
            />

            {/* Day picker */}
            <Text className="text-sm font-semibold text-graham-dark mb-2">
              Day
            </Text>
            <View className="flex-row gap-2 mb-4">
              {CONFERENCE_DAYS.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setFormDay(day.value)}
                  className={`flex-1 rounded-xl py-2.5 items-center border ${
                    formDay === day.value
                      ? "bg-graham-blue border-graham-blue"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      formDay === day.value ? "text-white" : "text-graham-muted"
                    }`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time inputs */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-graham-dark mb-2">
                  Start Time
                </Text>
                <View className="flex-row gap-1">
                  <TextInput
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center text-base border border-gray-200"
                    placeholder="HH"
                    placeholderTextColor={COLORS.muted}
                    value={formStartHour}
                    onChangeText={setFormStartHour}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text className="text-lg self-center">:</Text>
                  <TextInput
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center text-base border border-gray-200"
                    placeholder="MM"
                    placeholderTextColor={COLORS.muted}
                    value={formStartMin}
                    onChangeText={setFormStartMin}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-graham-dark mb-2">
                  End Time
                </Text>
                <View className="flex-row gap-1">
                  <TextInput
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center text-base border border-gray-200"
                    placeholder="HH"
                    placeholderTextColor={COLORS.muted}
                    value={formEndHour}
                    onChangeText={setFormEndHour}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text className="text-lg self-center">:</Text>
                  <TextInput
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center text-base border border-gray-200"
                    placeholder="MM"
                    placeholderTextColor={COLORS.muted}
                    value={formEndMin}
                    onChangeText={setFormEndMin}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            {/* Location */}
            <Text className="text-sm font-semibold text-graham-dark mb-2">
              Location
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-graham-dark mb-6 border border-gray-200"
              placeholder="e.g., Grand Ballroom"
              placeholderTextColor={COLORS.muted}
              value={formLocation}
              onChangeText={setFormLocation}
            />

            {/* Save button */}
            <TouchableOpacity
              onPress={saveItem}
              className="bg-graham-blue rounded-xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">
                {editingItem ? "Update Session" : "Add Session"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// =============================================================================
// NOTIFICATION BROADCAST
// =============================================================================
function NotificationBroadcast() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<NotificationTarget>("all");
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Title and body are required.");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("notifications").insert({
      title: title.trim(),
      body: body.trim(),
      target,
      sent_by: user?.id,
    });
    setSending(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Sent!", `Notification sent to ${target}.`);
      setTitle("");
      setBody("");
      setTarget("all");
    }
  };

  return (
    <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-lg font-bold text-graham-dark mb-4">
        Broadcast Notification
      </Text>

      {/* Target selector */}
      <Text className="text-sm font-semibold text-graham-dark mb-2">
        Target Audience
      </Text>
      <View className="flex-row gap-2 mb-4">
        {(["all", "finance", "hr"] as NotificationTarget[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTarget(t)}
            className={`flex-1 rounded-xl py-3 items-center border ${
              target === t
                ? "bg-graham-blue border-graham-blue"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                target === t ? "text-white" : "text-graham-muted"
              }`}
            >
              {t === "all" ? "All" : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text className="text-sm font-semibold text-graham-dark mb-2">
        Title
      </Text>
      <TextInput
        className="bg-white rounded-xl px-4 py-3 text-base text-graham-dark mb-4 border border-gray-200"
        placeholder="Notification title"
        placeholderTextColor={COLORS.muted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Body */}
      <Text className="text-sm font-semibold text-graham-dark mb-2">
        Message
      </Text>
      <TextInput
        className="bg-white rounded-xl px-4 py-3 text-base text-graham-dark mb-6 border border-gray-200"
        placeholder="Notification message..."
        placeholderTextColor={COLORS.muted}
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, textAlignVertical: "top" }}
      />

      <TouchableOpacity
        onPress={sendNotification}
        disabled={sending}
        className={`rounded-xl py-4 items-center ${
          sending ? "bg-blue-300" : "bg-graham-blue"
        }`}
      >
        <Text className="text-white font-bold text-base">
          {sending ? "Sending..." : "Send Notification"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// =============================================================================
// PARTICIPANT MANAGEMENT
// =============================================================================
function ParticipantManagement() {
  const [count, setCount] = useState(0);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    const { count: c } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true });
    setCount(c || 0);
  };

  // ── CSV Import for Participants ──────────────────────────────────────────
  // Expected CSV columns: full_name,email,department,title
  const importCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setImporting(true);
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as Record<string, string>[];
          let imported = 0;

          for (const row of rows) {
            const fullName = row.full_name?.trim();
            const email = row.email?.trim();
            if (!fullName || !email) continue;

            const { error } = await supabase.from("participants").insert({
              full_name: fullName,
              email,
              department: row.department?.trim() || "",
              title: row.title?.trim() || "",
            });

            if (!error) imported++;
          }

          setImporting(false);
          Alert.alert("Import Complete", `${imported} participants imported.`);
          fetchCount();
        },
        error: () => {
          setImporting(false);
          Alert.alert("Error", "Could not parse the CSV file.");
        },
      });
    } catch {
      setImporting(false);
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  const clearAll = () => {
    Alert.alert(
      "Clear All Participants",
      "This will remove all participant records. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await supabase.from("participants").delete().neq("id", "");
            fetchCount();
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-lg font-bold text-graham-dark mb-4">
        Manage Participants
      </Text>

      {/* Current count */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 items-center">
        <Text className="text-4xl font-bold text-graham-blue">{count}</Text>
        <Text className="text-sm text-graham-muted mt-1">
          Participants registered
        </Text>
      </View>

      {/* CSV format instructions */}
      <View className="bg-green-50 rounded-xl p-4 mb-4">
        <Text className="text-xs font-bold text-green-700 mb-1">
          CSV Format for Participants:
        </Text>
        <Text className="text-xs text-green-700 font-mono">
          full_name,email,department,title{"\n"}
          Jane Doe,jane@grahampackaging.com,Finance,VP Finance
        </Text>
      </View>

      {/* Import button */}
      <TouchableOpacity
        onPress={importCSV}
        disabled={importing}
        className={`rounded-xl py-4 flex-row items-center justify-center mb-3 ${
          importing ? "bg-green-300" : "bg-graham-green"
        }`}
      >
        <Upload size={18} color="#FFFFFF" />
        <Text className="text-white font-bold ml-2">
          {importing ? "Importing..." : "Import Participants CSV"}
        </Text>
      </TouchableOpacity>

      {/* Clear button */}
      <TouchableOpacity
        onPress={clearAll}
        className="rounded-xl py-4 flex-row items-center justify-center bg-red-50 border border-red-200"
      >
        <Trash2 size={18} color={COLORS.error} />
        <Text className="text-red-500 font-bold ml-2">
          Clear All Participants
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// =============================================================================
// PHOTO APPROVAL
// =============================================================================
function PhotoApproval() {
  const { user } = useAuth();
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (data) setPendingPhotos(data as Photo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const updateStatus = async (
    photoId: string,
    status: "approved" | "rejected"
  ) => {
    await supabase
      .from("photos")
      .update({ approval_status: status, approved_by: user?.id })
      .eq("id", photoId);
    fetchPending();
  };

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-lg font-bold text-graham-dark mb-4">
        Photo Approval Queue
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : pendingPhotos.length === 0 ? (
        <View className="bg-green-50 rounded-2xl p-8 items-center">
          <Check size={32} color={COLORS.green} />
          <Text className="text-base font-bold text-graham-dark mt-3">
            All Caught Up!
          </Text>
          <Text className="text-sm text-graham-muted mt-1 text-center">
            No photos pending approval.
          </Text>
        </View>
      ) : (
        pendingPhotos.map((photo) => (
          <View
            key={photo.id}
            className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
          >
            <Image
              source={{ uri: getPhotoUrl(photo.storage_path) }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-4">
              {photo.caption ? (
                <Text className="text-sm text-graham-dark mb-3">
                  {photo.caption}
                </Text>
              ) : null}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => updateStatus(photo.id, "approved")}
                  className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Check size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-1">Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(photo.id, "rejected")}
                  className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <X size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-1">Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// =============================================================================
// ANALYTICS DASHBOARD
// =============================================================================
function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalPhotos: 0,
    pendingPhotos: 0,
    approvedPhotos: 0,
    totalParticipants: 0,
    totalAgendaItems: 0,
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const [photos, pending, approved, participants, agenda, notifs] =
      await Promise.all([
        supabase.from("photos").select("*", { count: "exact", head: true }),
        supabase
          .from("photos")
          .select("*", { count: "exact", head: true })
          .eq("approval_status", "pending"),
        supabase
          .from("photos")
          .select("*", { count: "exact", head: true })
          .eq("approval_status", "approved"),
        supabase
          .from("participants")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("agenda_items")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true }),
      ]);

    setStats({
      totalPhotos: photos.count || 0,
      pendingPhotos: pending.count || 0,
      approvedPhotos: approved.count || 0,
      totalParticipants: participants.count || 0,
      totalAgendaItems: agenda.count || 0,
      totalNotifications: notifs.count || 0,
    });
    setLoading(false);
  };

  const statCards = [
    { label: "Total Photos", value: stats.totalPhotos, color: COLORS.accent },
    {
      label: "Pending Approval",
      value: stats.pendingPhotos,
      color: "#F59E0B",
    },
    {
      label: "Approved Photos",
      value: stats.approvedPhotos,
      color: COLORS.green,
    },
    {
      label: "Participants",
      value: stats.totalParticipants,
      color: COLORS.primary,
    },
    {
      label: "Agenda Sessions",
      value: stats.totalAgendaItems,
      color: "#8B5CF6",
    },
    {
      label: "Notifications Sent",
      value: stats.totalNotifications,
      color: "#EC4899",
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="text-lg font-bold text-graham-dark mb-4">
        Conference Analytics
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {statCards.map((card) => (
          <View
            key={card.label}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 items-center"
            style={{ width: "48%" }}
          >
            <Text style={{ color: card.color }} className="text-3xl font-bold">
              {card.value}
            </Text>
            <Text className="text-xs text-graham-muted mt-1 text-center">
              {card.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
