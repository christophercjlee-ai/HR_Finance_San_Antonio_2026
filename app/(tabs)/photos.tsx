// =============================================================================
// Photos Screen – Gallery of conference photos with upload and tagging
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/EmptyState";
import {
  Camera,
  Upload,
  X,
  Check,
  Search,
  ImageIcon,
} from "lucide-react-native";
import type { Photo, Participant } from "@/lib/types";

export default function PhotosScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data as Photo[]);
    }
    setLoading(false);
  }, []);

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("full_name");
    if (data) setParticipants(data as Participant[]);
  };

  useEffect(() => {
    fetchPhotos();
    fetchParticipants();
  }, [fetchPhotos]);

  // Realtime for new approved photos
  useEffect(() => {
    const channel = supabase
      .channel("photos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "photos" },
        () => fetchPhotos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPhotos]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to upload photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowUploadModal(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowUploadModal(true);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedImage || !user) return;

    setUploading(true);
    try {
      // Read the image file
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      // Create photo record
      const { error: insertError } = await supabase.from("photos").insert({
        uploader_id: user.id,
        storage_path: fileName,
        caption: caption.trim(),
        tags: selectedTags,
        approval_status: "pending",
      });

      if (insertError) throw insertError;

      Alert.alert(
        "Photo Uploaded!",
        "Your photo has been submitted for approval."
      );
      resetUploadModal();
    } catch (error) {
      Alert.alert("Upload Failed", "Could not upload the photo. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setSelectedImage(null);
    setCaption("");
    setSelectedTags([]);
    setTagSearch("");
  };

  const toggleTag = (participantId: string) => {
    setSelectedTags((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const filteredParticipants = participants.filter((p) =>
    p.full_name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Photos" subtitle="Conference memories" />

      {/* Upload buttons */}
      <View className="flex-row px-5 py-3 gap-3">
        <TouchableOpacity
          onPress={pickImage}
          className="flex-1 bg-graham-blue rounded-xl py-3 flex-row items-center justify-center"
        >
          <Upload size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={takePhoto}
          className="flex-1 bg-graham-accent rounded-xl py-3 flex-row items-center justify-center"
        >
          <Camera size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Photo grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <View className="flex-1 mb-2 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <Image
                source={{ uri: getPhotoUrl(item.storage_path) }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
              {item.caption ? (
                <Text
                  className="text-xs text-graham-muted px-2 py-1.5"
                  numberOfLines={1}
                >
                  {item.caption}
                </Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={ImageIcon}
              title="No Photos Yet"
              message="Be the first to share a conference photo! Tap Upload or Take Photo above."
            />
          }
        />
      )}

      {/* Upload Modal with tagging */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            {/* Modal header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-lg font-bold text-graham-dark">
                Upload Photo
              </Text>
              <TouchableOpacity onPress={resetUploadModal}>
                <X size={24} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5">
              {/* Preview */}
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-52 rounded-xl mb-4"
                  resizeMode="cover"
                />
              )}

              {/* Caption */}
              <Text className="text-sm font-semibold text-graham-dark mb-2">
                Caption (optional)
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-graham-dark mb-4 border border-gray-200"
                placeholder="Add a caption..."
                placeholderTextColor={COLORS.muted}
                value={caption}
                onChangeText={setCaption}
                multiline
              />

              {/* Tag participants */}
              <Text className="text-sm font-semibold text-graham-dark mb-2">
                Tag People
              </Text>

              {/* Selected tags */}
              {selectedTags.length > 0 && (
                <View className="flex-row flex-wrap mb-3">
                  {selectedTags.map((tagId) => {
                    const p = participants.find((pp) => pp.id === tagId);
                    return (
                      <TouchableOpacity
                        key={tagId}
                        onPress={() => toggleTag(tagId)}
                        className="bg-blue-100 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center"
                      >
                        <Text className="text-xs font-semibold text-graham-blue">
                          {p?.full_name}
                        </Text>
                        <X size={12} color={COLORS.primary} className="ml-1" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Search participants to tag */}
              <View className="bg-gray-50 rounded-xl px-4 py-2.5 flex-row items-center mb-3 border border-gray-200">
                <Search size={16} color={COLORS.muted} />
                <TextInput
                  className="flex-1 ml-2 text-sm text-graham-dark"
                  placeholder="Search people to tag..."
                  placeholderTextColor={COLORS.muted}
                  value={tagSearch}
                  onChangeText={setTagSearch}
                />
              </View>

              {tagSearch.length > 0 && (
                <View className="max-h-40 mb-4">
                  <ScrollView nestedScrollEnabled>
                    {filteredParticipants.slice(0, 10).map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          toggleTag(p.id);
                          setTagSearch("");
                        }}
                        className="flex-row items-center py-2.5 border-b border-gray-50"
                      >
                        <View className="w-8 h-8 rounded-full bg-graham-blue items-center justify-center mr-3">
                          <Text className="text-white text-xs font-bold">
                            {p.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </Text>
                        </View>
                        <Text className="flex-1 text-sm text-graham-dark">
                          {p.full_name}
                        </Text>
                        {selectedTags.includes(p.id) && (
                          <Check size={16} color={COLORS.green} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Upload button */}
              <TouchableOpacity
                onPress={uploadPhoto}
                disabled={uploading}
                className={`rounded-xl py-4 items-center mt-2 mb-6 ${
                  uploading ? "bg-blue-300" : "bg-graham-blue"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {uploading ? "Uploading..." : "Submit for Approval"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
