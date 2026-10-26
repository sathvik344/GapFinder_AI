import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./storage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}

export function getSupabaseAuthClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl!, supabaseAnonKey!);
}

export const LOCAL_DEMO_USER_KEY = "gapfinder_local_session";

function getLocalStorage(): Storage | null {
  if (typeof localStorage !== "undefined") return localStorage;
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return null;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        return {
          id: data.session.user.id,
          email: data.session.user.email || "user@gapfinder.ai",
          name: data.session.user.user_metadata?.name || data.session.user.email?.split("@")[0] || "Student",
          isDemo: false,
        };
      }
    } catch (e) {
      console.warn("Supabase session check error:", e);
    }
  }

  // Check local demo session
  const storage = getLocalStorage();
  if (storage) {
    const local = storage.getItem(LOCAL_DEMO_USER_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        storage.removeItem(LOCAL_DEMO_USER_KEY);
      }
    }
  }

  return null;
}

export async function signInUser(
  email: string,
  pass: string,
  remember = true
): Promise<{ user: UserProfile | null; error: string | null }> {
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split("@")[0],
          isDemo: false,
        };
        return { user: profile, error: null };
      }
    } catch (err: any) {
      return { user: null, error: err.message || "Network error connecting to Supabase Auth." };
    }
  }

  return {
    user: null,
    error: "SUPABASE_NOT_CONFIGURED",
  };
}

export async function signUpUser(
  name: string,
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name,
          isDemo: false,
        };
        const confirmationRequired = !data.session;
        return { user: profile, error: null, confirmationRequired };
      }
    } catch (err: any) {
      return { user: null, error: err.message || "Network error connecting to Supabase Auth." };
    }
  }

  return {
    user: null,
    error: "SUPABASE_NOT_CONFIGURED",
  };
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
  }

  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(LOCAL_DEMO_USER_KEY);
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }
}

export function startDemoSession(name = "Demo Student", email = "demo@gapfinder.ai"): UserProfile {
  const profile: UserProfile = {
    id: "usr-demo-session",
    email,
    name,
    isDemo: true,
  };
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(profile));
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }
  return profile;
}
