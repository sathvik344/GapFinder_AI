import { describe, it, expect, beforeEach } from "vitest";
import {
  getCurrentUser,
  signInUser,
  signUpUser,
  startDemoSession,
  signOutUser,
  isSupabaseAuthConfigured,
  getSupabaseConfigError,
  findStoredUser,
  getStoredUserAccounts,
} from "../src/lib/auth";
import { getSupabaseConfig } from "../src/lib/supabaseConfig";

describe("Authentication & Stored Database Management", () => {
  beforeEach(() => {
    // Setup mock browser storage in test environment
    const mockStorage: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
    } as any;
  });

  it("authenticates seeded default accounts from the stored database", async () => {
    const res = await signInUser("student@gapfinder.ai", "password123");
    expect(res.user).not.toBeNull();
    expect(res.user?.email).toBe("student@gapfinder.ai");
    expect(res.error).toBeNull();

    // Verify session persistence
    const current = await getCurrentUser();
    expect(current).not.toBeNull();
    expect(current?.email).toBe("student@gapfinder.ai");
    expect(current?.isDemo).toBe(false);
  });

  it("returns ACCOUNT_NOT_FOUND when user is not stored in the database", async () => {
    const res = await signInUser("unknown_student@university.edu", "password123");
    expect(res.user).toBeNull();
    expect(res.code).toBe("ACCOUNT_NOT_FOUND");
    expect(res.error).toContain("Account not found in our database");
    expect(res.error).toContain("create an account");
  });

  it("returns INVALID_PASSWORD when user exists in database but password does not match", async () => {
    const res = await signInUser("student@gapfinder.ai", "wrong_password_999");
    expect(res.user).toBeNull();
    expect(res.code).toBe("INVALID_PASSWORD");
    expect(res.error).toContain("Invalid password");
  });

  it("registers a new user in the stored database and allows subsequent login", async () => {
    const newEmail = "new_student_2026@university.edu";
    const newPass = "strongSecret123";

    // 1. Sign up new account
    const regRes = await signUpUser("Samantha Brown", newEmail, newPass);
    expect(regRes.user).not.toBeNull();
    expect(regRes.user?.email).toBe(newEmail);
    expect(regRes.user?.name).toBe("Samantha Brown");
    expect(regRes.error).toBeNull();

    // 2. Sign out
    await signOutUser();
    const afterSignOut = await getCurrentUser();
    expect(afterSignOut).toBeNull();

    // 3. Log in with the newly stored account
    const loginRes = await signInUser(newEmail, newPass);
    expect(loginRes.user).not.toBeNull();
    expect(loginRes.user?.email).toBe(newEmail);
    expect(loginRes.error).toBeNull();
  });

  it("prevents duplicate registration of an existing stored account", async () => {
    const regRes = await signUpUser("Duplicate Student", "student@gapfinder.ai", "password123");
    expect(regRes.user).toBeNull();
    expect(regRes.code).toBe("ACCOUNT_ALREADY_EXISTS");
    expect(regRes.error).toContain("already exists in our database");
  });

  it("creates and retrieves a local demo session for evaluator exploration", async () => {
    const demoUser = startDemoSession("Evaluator User", "evaluator@gapfinder.ai");
    expect(demoUser.isDemo).toBe(true);
    expect(demoUser.email).toBe("evaluator@gapfinder.ai");
    expect(demoUser.name).toBe("Evaluator User");

    const retrieved = await getCurrentUser();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe("evaluator@gapfinder.ai");
    expect(retrieved?.isDemo).toBe(true);

    await signOutUser();
    const afterSignOut = await getCurrentUser();
    expect(afterSignOut).toBeNull();
  });

  it("accurately detects missing or placeholder Supabase credentials", () => {
    const config = getSupabaseConfig();
    expect(typeof config.isConfigured).toBe("boolean");
    if (!config.isConfigured) {
      expect(config.reason).toBeDefined();
      expect(typeof config.reason).toBe("string");
      expect(getSupabaseConfigError()).not.toBeNull();
    }
  });
});
