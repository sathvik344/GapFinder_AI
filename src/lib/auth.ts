import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}

export const LOCAL_DEMO_USER_KEY = "gapfinder_local_session";

// Environment variable readers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase credentials have been configured in .env.local
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project") &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes("your_supabase_anon_key") &&
    supabaseAnonKey.length > 20
  );
}

// Browser-side Supabase client singleton to prevent multiple GoTrueClient instances
let browserClient: SupabaseClient | null = null;

export function getSupabaseAuthClient(): SupabaseClient | null {
  if (!isSupabaseAuthConfigured()) return null;

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return browserClient;
  }

  // Server-side fallback instance
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getLocalStorage(): Storage | null {
  if (typeof localStorage !== "undefined") return localStorage;
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return null;
}

/**
 * Retrieves the currently active user profile from either:
 * 1. Live Supabase Auth session
 * 2. Explicit Local Demo Session
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        const u = data.session.user;
        const name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email?.split("@")[0] ||
          "Student";

        return {
          id: u.id,
          email: u.email || "student@gapfinder.ai",
          name,
          isDemo: false,
        };
      }
    } catch (e) {
      console.warn("Supabase auth session fetch error:", e);
    }
  }

  // Fallback to local demo session if active
  const storage = getLocalStorage();
  if (storage) {
    const local = storage.getItem(LOCAL_DEMO_USER_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch {
        storage.removeItem(LOCAL_DEMO_USER_KEY);
      }
    }
  }

  return null;
}

/**
 * Signs in a user using Supabase Auth signInWithPassword
 */
export async function signInUser(
  email: string,
  pass: string,
  remember = true
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!isSupabaseAuthConfigured()) {
    return {
      user: null,
      error: "SUPABASE_NOT_CONFIGURED",
    };
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return {
      user: null,
      error: "SUPABASE_NOT_CONFIGURED",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      // Map common Supabase error codes to clear user-friendly messages
      let message = error.message;
      if (
        message.toLowerCase().includes("invalid login credentials") ||
        message.toLowerCase().includes("invalid credentials")
      ) {
        message = "Invalid email or password.";
      } else if (message.toLowerCase().includes("email not confirmed")) {
        message = "Please verify your email address before signing in. Check your inbox for the confirmation link.";
      }
      return { user: null, error: message };
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split("@")[0],
        isDemo: false,
      };

      // Clear any prior demo session on successful real login
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(LOCAL_DEMO_USER_KEY);
      }

      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new Event("gapfinder-auth-change"));
      }

      return { user: profile, error: null };
    }

    return { user: null, error: "An unexpected error occurred during sign in." };
  } catch (err: any) {
    return {
      user: null,
      error: err.message || "Network error communicating with Supabase Auth service.",
    };
  }
}

/**
 * Registers a new user using Supabase Auth signUp with full name stored in user metadata
 */
export async function signUpUser(
  name: string,
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
  if (!isSupabaseAuthConfigured()) {
    return {
      user: null,
      error: "SUPABASE_NOT_CONFIGURED",
    };
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return {
      user: null,
      error: "SUPABASE_NOT_CONFIGURED",
    };
  }

  try {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: pass,
      options: {
        data: {
          full_name: trimmedName,
          name: trimmedName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        name: trimmedName,
        isDemo: false,
      };

      // If Supabase has email confirmation enabled, session will be null
      const confirmationRequired = !data.session;

      if (!confirmationRequired) {
        const storage = getLocalStorage();
        if (storage) {
          storage.removeItem(LOCAL_DEMO_USER_KEY);
        }
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new Event("gapfinder-auth-change"));
        }
      }

      return { user: profile, error: null, confirmationRequired };
    }

    return { user: null, error: "Could not create user account." };
  } catch (err: any) {
    return {
      user: null,
      error: err.message || "Network error communicating with Supabase Auth service.",
    };
  }
}

/**
 * Signs out the current user from both Supabase Auth and demo session
 */
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

/**
 * Sends a password reset email via Supabase Auth
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseAuthConfigured()) {
    return { success: false, error: "SUPABASE_NOT_CONFIGURED" };
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return { success: false, error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error sending reset email." };
  }
}

/**
 * Creates an explicit local demo session for evaluator exploration
 */
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
