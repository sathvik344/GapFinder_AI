"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getSupabaseAuthClient,
  isSupabaseAuthConfigured,
  signOutUser,
  startDemoSession,
  UserProfile,
} from "@/lib/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  logout: () => Promise<void>;
  loginDemo: (name?: string, email?: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  logout: async () => {},
  loginDemo: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseAuthConfigured();

  const refreshUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // 1. Supabase onAuthStateChange listener
    const supabase = getSupabaseAuthClient();
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            const name =
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email?.split("@")[0] ||
              "Student";

            setUser({
              id: u.id,
              email: u.email || "student@gapfinder.ai",
              name,
              isDemo: false,
            });
            setLoading(false);
          } else {
            // Re-evaluate if there's a demo session or if completely logged out
            refreshUser();
          }
        });
        authSubscription = data.subscription;
      } catch (e) {
        console.warn("Could not attach Supabase auth state listener:", e);
      }
    }

    // 2. Custom storage & window event listener for cross-tab or demo sync
    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener("gapfinder-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      window.removeEventListener("gapfinder-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  const loginDemo = (name?: string, email?: string) => {
    const demo = startDemoSession(name, email);
    setUser(demo);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured, logout, loginDemo, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
