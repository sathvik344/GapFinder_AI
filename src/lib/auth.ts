import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabaseConfig";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}

export interface StoredUserAccount {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export const ACTIVE_SESSION_KEY = "gapfinder_active_session";
export const LOCAL_DEMO_USER_KEY = "gapfinder_local_session";
export const STORED_USERS_KEY = "gapfinder_stored_users";

/**
 * Default seeded student & evaluator accounts stored in the database
 */
export const DEFAULT_STORED_USERS: StoredUserAccount[] = [
  {
    id: "usr-student-001",
    email: "student@gapfinder.ai",
    name: "Alex Chen",
    password: "password123",
    createdAt: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "usr-evaluator-001",
    email: "evaluator@gapfinder.ai",
    name: "Faculty Evaluator",
    password: "password123",
    createdAt: "2026-10-21T10:00:00.000Z",
  },
  {
    id: "usr-demo-001",
    email: "demo@gapfinder.ai",
    name: "Demo Student",
    password: "password123",
    createdAt: "2026-10-22T10:00:00.000Z",
  },
];

// Fallback in-memory list for server-side or non-browser test environments
let inMemoryUsers: StoredUserAccount[] = [...DEFAULT_STORED_USERS];

function getLocalStorage(): Storage | null {
  if (typeof localStorage !== "undefined") return localStorage;
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return null;
}

/**
 * Retrieves all stored user accounts from persistent database storage
 */
export function getStoredUserAccounts(): StoredUserAccount[] {
  const storage = getLocalStorage();
  if (!storage) return inMemoryUsers;

  try {
    const raw = storage.getItem(STORED_USERS_KEY);
    if (!raw) {
      storage.setItem(STORED_USERS_KEY, JSON.stringify(DEFAULT_STORED_USERS));
      return [...DEFAULT_STORED_USERS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    storage.setItem(STORED_USERS_KEY, JSON.stringify(DEFAULT_STORED_USERS));
    return [...DEFAULT_STORED_USERS];
  } catch {
    return inMemoryUsers;
  }
}

/**
 * Finds a stored user by email address (case-insensitive)
 */
export function findStoredUser(email: string): StoredUserAccount | null {
  const clean = email.trim().toLowerCase();
  const accounts = getStoredUserAccounts();
  const match = accounts.find((a) => a.email.trim().toLowerCase() === clean);
  if (match) return match;
  return inMemoryUsers.find((a) => a.email.trim().toLowerCase() === clean) || null;
}

/**
 * Persists a user account into stored database storage
 */
export function saveStoredUser(account: StoredUserAccount): void {
  const clean = account.email.trim().toLowerCase();

  // Update in-memory fallback
  const memIdx = inMemoryUsers.findIndex((a) => a.email.trim().toLowerCase() === clean);
  if (memIdx >= 0) {
    inMemoryUsers[memIdx] = account;
  } else {
    inMemoryUsers.push(account);
  }

  // Update persistent storage
  const storage = getLocalStorage();
  if (storage) {
    try {
      const accounts = getStoredUserAccounts();
      const idx = accounts.findIndex((a) => a.email.trim().toLowerCase() === clean);
      if (idx >= 0) {
        accounts[idx] = account;
      } else {
        accounts.push(account);
      }
      storage.setItem(STORED_USERS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }
}

/**
 * Checks whether valid Supabase credentials have been configured in .env.local
 */
export function isSupabaseAuthConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

/**
 * Gets the reason why Supabase authentication is not configured
 */
export function getSupabaseConfigError(): string | null {
  const cfg = getSupabaseConfig();
  return cfg.isConfigured ? null : (cfg.reason || "Supabase credentials missing from .env.local.");
}

// Browser-side Supabase client singleton to prevent multiple GoTrueClient instances
let browserClient: SupabaseClient | null = null;

export function getSupabaseAuthClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured || !cfg.url || !cfg.anonKey) return null;

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient(cfg.url, cfg.anonKey, {
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
  return createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Retrieves the currently active user profile from:
 * 1. Live Supabase Auth session (if active)
 * 2. Active stored database session
 * 3. Explicit Local Demo Session
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

  const storage = getLocalStorage();
  if (storage) {
    // Check active stored database session
    const active = storage.getItem(ACTIVE_SESSION_KEY);
    if (active) {
      try {
        const parsed = JSON.parse(active);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch {
        storage.removeItem(ACTIVE_SESSION_KEY);
      }
    }

    // Fallback to local demo session if active
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

export interface SignInResult {
  user: UserProfile | null;
  error: string | null;
  code?: "ACCOUNT_NOT_FOUND" | "INVALID_PASSWORD" | "INVALID_CREDENTIALS" | "EMAIL_NOT_CONFIRMED" | "NETWORK_ERROR";
}

/**
 * Signs in a user from the stored database (or Supabase Auth if configured).
 * If the user is not found in the stored database, explicitly informs them to create an account.
 */
export async function signInUser(
  email: string,
  pass: string,
  remember = true
): Promise<SignInResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cfg = getSupabaseConfig();

  // 1. If Supabase is configured, attempt live Supabase authentication first
  if (cfg.isConfigured) {
    const supabase = getSupabaseAuthClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              cleanEmail.split("@")[0],
            isDemo: false,
          };

          const storage = getLocalStorage();
          if (storage) {
            storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
            storage.removeItem(LOCAL_DEMO_USER_KEY);
          }

          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new Event("gapfinder-auth-change"));
          }

          return { user: profile, error: null };
        }

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("email not confirmed")) {
            return {
              user: null,
              error: "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
              code: "EMAIL_NOT_CONFIRMED",
            };
          }
        }
      } catch (err: any) {
        console.warn("Supabase auth query notice:", err?.message);
      }
    }
  }

  // 2. Query the stored database
  const storedUser = findStoredUser(cleanEmail);

  if (!storedUser) {
    return {
      user: null,
      error: "Account not found in our database. Please create an account to get started.",
      code: "ACCOUNT_NOT_FOUND",
    };
  }

  if (storedUser.password !== pass) {
    return {
      user: null,
      error: "Invalid password for this account. Please verify your password or create a new account.",
      code: "INVALID_PASSWORD",
    };
  }

  // Stored user authenticated successfully
  const profile: UserProfile = {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name,
    isDemo: false,
  };

  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
    storage.removeItem(LOCAL_DEMO_USER_KEY);
  }

  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }

  return { user: profile, error: null };
}

export interface SignUpResult {
  user: UserProfile | null;
  error: string | null;
  confirmationRequired?: boolean;
  code?: "ACCOUNT_ALREADY_EXISTS" | "NETWORK_ERROR";
}

/**
 * Registers a new user into the stored database (and Supabase Auth if configured)
 */
export async function signUpUser(
  name: string,
  email: string,
  pass: string
): Promise<SignUpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // 1. Check if the account is already stored in the database
  const existing = findStoredUser(cleanEmail);
  if (existing) {
    return {
      user: null,
      error: "An account with this email already exists in our database. Please sign in instead.",
      code: "ACCOUNT_ALREADY_EXISTS",
    };
  }

  // 2. Create and persist user account in the stored database
  const newAccount: StoredUserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: cleanName,
    password: pass,
    createdAt: new Date().toISOString(),
  };
  saveStoredUser(newAccount);

  const profile: UserProfile = {
    id: newAccount.id,
    email: newAccount.email,
    name: newAccount.name,
    isDemo: false,
  };

  // 3. If Supabase is configured, also register on Supabase Auth
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    const supabase = getSupabaseAuthClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
            },
          },
        });

        if (error) {
          console.warn("Supabase auth signUp notice:", error.message);
        } else if (data?.user && !data.session) {
          // Email confirmation is required by Supabase settings
          return {
            user: profile,
            error: null,
            confirmationRequired: true,
          };
        }
      } catch (err: any) {
        console.warn("Supabase signUp network notice:", err?.message);
      }
    }
  }

  // Persist session locally
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
    storage.removeItem(LOCAL_DEMO_USER_KEY);
  }

  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }

  return { user: profile, error: null, confirmationRequired: false };
}

/**
 * Signs out the current user from both Supabase Auth and active database sessions
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
    storage.removeItem(ACTIVE_SESSION_KEY);
    storage.removeItem(LOCAL_DEMO_USER_KEY);
  }

  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }
}

/**
 * Sends a password reset email via Supabase Auth or verifies email in stored database
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  const cfg = getSupabaseConfig();

  if (cfg.isConfigured) {
    const supabase = getSupabaseAuthClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
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
  }

  // Check stored database
  const user = findStoredUser(cleanEmail);
  if (!user) {
    return {
      success: false,
      error: "Account not found in our database. Please create an account to get started.",
    };
  }

  return { success: true, error: null };
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
    storage.removeItem(ACTIVE_SESSION_KEY);
    storage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(profile));
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("gapfinder-auth-change"));
  }
  return profile;
}
