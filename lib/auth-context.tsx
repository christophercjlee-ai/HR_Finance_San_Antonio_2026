import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "./types";
import type { Session } from "@supabase/supabase-js";
import { Platform } from "react-native";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  verifyCode: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  verifyCode: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setUser(data as User);
    }
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      await fetchUser(session.user.id);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.location.search.includes("code=")) {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("Magic link exchange failed:", err);
        }
      }
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s?.user?.id) {
        await fetchUser(s.user.id);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        fetchUser(s.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: Platform.OS === "web" ? "https://hr-finance-san-antonio-2026.vercel.app" : "graham-conference://auth/callback",
      },
    });
    return { error: error as Error | null };
  };

  const verifyCode = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin: user?.role === "admin",
        loading,
        signInWithEmail,
        verifyCode,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
