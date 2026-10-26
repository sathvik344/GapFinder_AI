import { describe, it, expect, beforeEach } from "vitest";
import { getCurrentUser, signInUser, signUpUser, startDemoSession, signOutUser, LOCAL_DEMO_USER_KEY } from "../src/lib/auth";

describe("Authentication & Session Management", () => {
  beforeEach(() => {
    // Clear mock browser storage if present
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("returns SUPABASE_NOT_CONFIGURED when credentials are not configured", async () => {
    const res = await signInUser("student@university.edu", "password123");
    expect(res.user).toBeNull();
    expect(res.error).toBe("SUPABASE_NOT_CONFIGURED");

    const reg = await signUpUser("Alice Student", "alice@university.edu", "password123");
    expect(reg.user).toBeNull();
    expect(reg.error).toBe("SUPABASE_NOT_CONFIGURED");
  });

  it("creates and retrieves a local demo session for evaluator exploration", async () => {
    // Simulates mock localStorage in test environment
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

    const demoUser = startDemoSession("Evaluator User", "evaluator@gapfinder.ai");
    expect(demoUser.isDemo).toBe(true);
    expect(demoUser.email).toBe("evaluator@gapfinder.ai");
    expect(demoUser.name).toBe("Evaluator User");

    const retrieved = await getCurrentUser();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe("evaluator@gapfinder.ai");

    await signOutUser();
    const afterSignOut = await getCurrentUser();
    expect(afterSignOut).toBeNull();
  });
});
