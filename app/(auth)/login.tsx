import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/lib/auth-context";
import { CONFERENCE, COLORS, ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";
import { GrahamLogo } from "@/components/GrahamLogo";
import { Mail, KeyRound } from "lucide-react-native";

type Step = "email" | "code";

export default function LoginScreen() {
  const { signInWithEmail, verifyCode } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      Alert.alert("Invalid Email", `Please use your @${ALLOWED_EMAIL_DOMAIN} email address to sign in.`);
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(trimmedEmail);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setEmail(trimmedEmail);
      setCode("");
      setStep("code");
    }
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    const { error } = await verifyCode(email, trimmedCode);
    setLoading(false);
    if (error) {
      Alert.alert("Incorrect Code", "The code you entered is invalid or has expired. Request a new one.");
    }
    // On success, the auth-context onAuthStateChange fires SIGNED_IN and the
    // router at app/index.tsx redirects to /(tabs)/home automatically.
  };

  const handleResend = async () => {
    setLoading(true);
    const { error } = await signInWithEmail(email);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Sent", "A new code has been sent to your email.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          <View className="items-center mb-10">
            <GrahamLogo variant="full" width={260} />
            <Text className="text-lg font-semibold text-graham-dark mt-6 text-center">
              {CONFERENCE.shortTitle}
            </Text>
            <Text className="text-sm text-graham-muted mt-1 text-center">
              {CONFERENCE.dateRangeDisplay}
            </Text>
          </View>

          {step === "email" ? (
            <View>
              <Text className="text-2xl font-bold text-graham-dark text-center mb-2">
                Welcome
              </Text>
              <Text className="text-graham-muted text-center mb-8">
                Sign in with your Graham email
              </Text>

              <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <Mail size={20} color={COLORS.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-graham-dark"
                  placeholder={`name@${ALLOWED_EMAIL_DOMAIN}`}
                  placeholderTextColor={COLORS.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={loading || !email.trim()}
                className={`rounded-xl py-4 items-center mt-2 ${
                  loading || !email.trim() ? "bg-blue-300" : "bg-graham-blue"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Sending code..." : "Send Login Code"}
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-graham-muted text-center mt-4">
                Only @{ALLOWED_EMAIL_DOMAIN} email addresses are allowed.
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-2xl font-bold text-graham-dark text-center mb-2">
                Check your email
              </Text>
              <Text className="text-graham-muted text-center mb-2">
                We sent a 6-digit code to
              </Text>
              <Text className="text-graham-dark font-semibold text-center mb-8">
                {email}
              </Text>

              <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <KeyRound size={20} color={COLORS.muted} />
                <TextInput
                  className="flex-1 ml-3 text-2xl text-graham-dark tracking-widest text-center font-mono"
                  placeholder="123456"
                  placeholderTextColor={COLORS.muted}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading || code.length !== 6}
                className={`rounded-xl py-4 items-center mt-2 ${
                  loading || code.length !== 6 ? "bg-blue-300" : "bg-graham-blue"
                }`}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6 gap-4">
                <TouchableOpacity onPress={() => setStep("email")}>
                  <Text className="text-graham-muted text-sm">Use a different email</Text>
                </TouchableOpacity>
                <Text className="text-graham-muted text-sm">·</Text>
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text className="text-graham-blue text-sm font-semibold">Resend code</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-graham-muted text-center mt-6">
                Tip: if you're on your phone, type the code here.
                {"\n"}You do not need to click the email link.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

