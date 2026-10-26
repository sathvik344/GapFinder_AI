/**
 * Safe Supabase Environment Configuration & Validation
 * Centralizes environment variable detection across client and server.
 */

export interface SupabaseEnvConfig {
  url: string | null;
  anonKey: string | null;
  serviceKey: string | null;
  isConfigured: boolean;
  reason?: string;
}

export function getSupabaseConfig(): SupabaseEnvConfig {
  // Support both standard NEXT_PUBLIC_SUPABASE_URL and optional SUPABASE_URL
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== "undefined" && process.env ? process.env.SUPABASE_URL : undefined) ||
    null;

  // Support NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or server SUPABASE_ANON_KEY
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    (typeof process !== "undefined" && process.env ? process.env.SUPABASE_ANON_KEY : undefined) ||
    null;

  // Server-side service role key (only accessible on server)
  const serviceKey =
    (typeof process !== "undefined" && process.env
      ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
      : undefined) || null;

  const cleanUrl = url?.trim() || null;
  const cleanAnon = anonKey?.trim() || null;
  const cleanService = serviceKey?.trim() || null;

  // Validation step 1: URL presence
  if (!cleanUrl) {
    return {
      url: null,
      anonKey: cleanAnon,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_URL is missing. Add it to .env.local.",
    };
  }

  // Validation step 2: URL format
  if (!cleanUrl.startsWith("https://")) {
    return {
      url: cleanUrl,
      anonKey: cleanAnon,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_URL must start with https:// (e.g. https://xyzcompany.supabase.co).",
    };
  }

  // Validation step 3: Obvious URL placeholders
  if (
    cleanUrl.includes("your-project") ||
    cleanUrl.includes("example.com") ||
    cleanUrl.includes("<") ||
    cleanUrl.includes("YOUR_")
  ) {
    return {
      url: cleanUrl,
      anonKey: cleanAnon,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_URL contains a placeholder. Replace it with your actual project URL in .env.local.",
    };
  }

  // Validation step 4: Key presence
  const effectiveKey = cleanAnon || cleanService;
  if (!effectiveKey) {
    return {
      url: cleanUrl,
      anonKey: null,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Add it to .env.local.",
    };
  }

  // Validation step 5: Obvious Key placeholders
  if (
    effectiveKey.includes("your_supabase_anon_key") ||
    effectiveKey.includes("your-anon-key") ||
    effectiveKey.includes("<") ||
    effectiveKey.includes("YOUR_")
  ) {
    return {
      url: cleanUrl,
      anonKey: cleanAnon,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_ANON_KEY contains a placeholder. Replace it with your real anon key in .env.local.",
    };
  }

  // Validation step 6: Minimum length check (JWT keys are 100+ chars, minimum 20)
  if (effectiveKey.length < 20) {
    return {
      url: cleanUrl,
      anonKey: cleanAnon,
      serviceKey: cleanService,
      isConfigured: false,
      reason: "NEXT_PUBLIC_SUPABASE_ANON_KEY is too short. Ensure you copied the full key from Supabase API settings.",
    };
  }

  return {
    url: cleanUrl,
    anonKey: cleanAnon,
    serviceKey: cleanService,
    isConfigured: true,
  };
}
