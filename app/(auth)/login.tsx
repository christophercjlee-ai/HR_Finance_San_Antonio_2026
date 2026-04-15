import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useAuth } from "@/lib/auth-context";
import { CONFERENCE, COLORS, ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";
import { GrahamLogo } from "@/components/GrahamLogo";
import { Mail } from "lucide-react-native";

export default function LoginScreen() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      Alert.alert("Invalid Email", `Please use your @${ALLOWED_EMAIL_DOMAIN} email address to sign in.`);
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(trimmedEmail);
    setLoading(false);
    if (error) { Alert.alert("Error", error.message); } else { setSent(true); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-8 py-12">
          <View className="items-center mb-10">
            <GrahamLogo variant="full" width={260} />
            <Text className="text-lg font-semibold text-graham-dark mt-6 text-center">{CONFERENCE.shortTitle}</Text>
            <Text className="text-sm text-graham-muted mt-1 text-center">{CONFERENCE.dateRangeDisplay}</Text>
          </View>

          {sent ? (
            <View className="items-center bg-green-50 rounded-2xl p-8">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                <Mail size={32} color={COLORS.green} />
              </View>
              <Text className="text-xl font-bold text-graham-dark text-center mb-2">Check Your Email</Text>
              <Text className="text-graham-muted text-center leading-6">
                We sent a magic link to{"\n"}
                <Text className="font-semibold text-graham-dark">{email}</Text>
                {"\n"}Tap the link in the email to sign in.
              </Text>
              <TouchableOpacity onPress={() => setSent(false)} className="mt-6">
                <Text className="text-graham-blue font-semibold">Use a different email</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-2xl font-bold text-graham-dark text-center mb-2">Welcome</Text>
              <Text className="text-graham-muted text-center mb-8">Sign in with your Graham email</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <Mail size={20} color={COLORS.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-graham-dark"
                  placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`}
                  placeholderTextColor={COLORS.muted}
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
                />
              </View>
              <TouchableOpacity onPress={handleLogin} disabled={loading || !email.trim()}
                className={`rounded-xl py-4 items-center mt-2 ${loading || !email.trim() ? "bg-blue-300" : "bg-graham-blue"}`}>
                <Text className="text-white font-bold text-base">{loading ? "Sending link..." : "Send Magic Link"}</Text>
              </TouchableOpacity>
              <Text className="text-xs text-graham-muted text-center mt-4">Only @{ALLOWED_EMAIL_DOMAIN} email addresses are allowed.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
