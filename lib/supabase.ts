import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = "https://fwptxtnbknfknxuxxwek.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHR4dG5ia25ma254dXh4d2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzU5MzksImV4cCI6MjA5MDA1MTkzOX0.bFz6oQx3dh8TDiICFSyVMAJsMhHB4EU5oWTWlMx44kc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
