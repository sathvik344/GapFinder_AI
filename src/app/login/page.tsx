"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { signInUser, sendPasswordResetEmail, isSupabaseAuthConfigured } from "@/lib/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Target,
  Clock,
  Database,
  UserPlus,
  Compass,
  FileCheck,
  BookOpen,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/";
  const paramEmail = searchParams?.get("email") || "";

  const { user, loginDemo } = useAuth();
  const isConfigured = isSupabaseAuthConfigured();

  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState(false);

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (paramEmail && !email) {
      setEmail(paramEmail);
    }
  }, [paramEmail, email]);

  // If already logged in, redirect to destination
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setAccountNotFound(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid academic or personal email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signInUser(cleanEmail, password, rememberMe);

      if (res.code === "ACCOUNT_NOT_FOUND") {
        setAccountNotFound(true);
      } else if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setSuccessMsg(`Login successful! Welcome back, ${res.user.name || "Student"}. Redirecting to dashboard...`);
        setTimeout(() => {
          router.push(redirectPath);
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred while connecting to authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemo("Student Evaluator", "evaluator@gapfinder.ai");
    router.push(redirectPath);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      setResetStatus({ success: false, message: "Please enter a valid email address." });
      return;
    }
    setResetLoading(true);
    setResetStatus(null);

    try {
      const res = await sendPasswordResetEmail(resetEmail);
      if (res.error) {
        setResetStatus({ success: false, message: res.error });
      } else {
        setResetStatus({
          success: true,
          message: "Password recovery instructions have been sent to your email address.",
        });
      }
    } catch (err: any) {
      setResetStatus({ success: false, message: err.message || "Failed to send reset email." });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-ivory-50 dark:bg-pine-950 text-forest-900 dark:text-ivory-50 transition-colors duration-200">
      {/* Floating Theme Toggle (Always Available) */}
      <div className="absolute top-5 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Left Column: Academic Analytics & Knowledge Lab Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-950 p-12 text-ivory-50 relative flex-col justify-between overflow-hidden border-r border-forest-850">
        {/* Subtle Ambient Emerald Lighting */}
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-forest-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[34rem] h-[34rem] bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-forest-900 border border-forest-750 flex items-center justify-center text-ivory-50 shadow-md">
            <Compass className="w-6 h-6 text-coral-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-ivory-50 text-xl tracking-tight">
                GapFinder <span className="text-coral-500">AI</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 text-forest-200 font-semibold border border-forest-700/50">
                Diagnostic Lab
              </span>
            </div>
            <span className="text-[11px] text-forest-300 font-medium tracking-wide">
              Evidence-Based Knowledge Audit & Spaced Revision
            </span>
          </div>
        </div>

        {/* Center: Topic Mastery Analytics Visualizer Card */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/90 border border-forest-750 text-forest-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-coral-400" />
              <span>Diagnostic Knowledge Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-ivory-50">
              Bridge your exam gaps with mathematical precision.
            </h2>
            <p className="text-xs text-forest-200 leading-relaxed">
              Upload your syllabus, textbooks, and past papers. GapFinder computes real topic mastery, pinpoints weak concepts below 60%, and schedules optimal revision slots.
            </p>
          </div>

          {/* Interactive Topic Mastery Sample Preview */}
          <div className="p-4 rounded-2xl bg-forest-900/70 border border-forest-800 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ivory-100">Live Knowledge Diagnostics</span>
              <span className="text-[11px] text-coral-400 font-semibold">CS401 Computer Networks</span>
            </div>

            {/* Weak Topic Indicator */}
            <div className="p-3 rounded-xl bg-coral-950/40 border border-coral-800/40 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-coral-200 block">TCP Congestion & AIMD</span>
                <span className="text-[10px] text-forest-300">Unit 4 • 3 missed diagnostic questions</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-coral-400 block">54%</span>
                <span className="text-[9px] uppercase font-bold text-coral-300 px-1.5 py-0.5 rounded bg-coral-950/80 border border-coral-800/50">
                  Weak
                </span>
              </div>
            </div>

            {/* Strong Topic Indicator */}
            <div className="p-3 rounded-xl bg-forest-850/60 border border-forest-750 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-forest-100 block">Dijkstra Link-State Algorithm</span>
                <span className="text-[10px] text-forest-300">Unit 3 • 4/4 correct past paper drills</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 block">88%</span>
                <span className="text-[9px] uppercase font-bold text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
                  Strong
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-forest-300 border-t border-forest-800/80">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-coral-400" />
                <span>Today: 2h 15m Allocated</span>
              </span>
              <span className="text-forest-200 font-medium">50% Allocated to Weak Topics</span>
            </div>
          </div>

          {/* Key Product Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-forest-900/50 border border-forest-800">
              <BookOpen className="w-4 h-4 text-coral-400 mb-1" />
              <span className="text-xs font-bold text-ivory-100 block">Strict RAG Grounding</span>
              <span className="text-[11px] text-forest-300">Diagnostic questions derived strictly from course files</span>
            </div>
            <div className="p-3 rounded-xl bg-forest-900/50 border border-forest-800">
              <Target className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-ivory-100 block">Verifiable Citations</span>
              <span className="text-[11px] text-forest-300">Exact page & section audit references</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-forest-850 text-[11px] text-forest-400 flex items-center justify-between">
          <span>Stored Database & Live Supabase PostgreSQL Ready</span>
          <span className="text-coral-400 font-semibold">Next.js 14 App Router</span>
        </div>
      </div>

      {/* Right Column: Warm Ivory Authentication Card */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {/* Mobile Brand Header */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-forest-900 flex items-center justify-center text-ivory-50 shadow-md">
            <Compass className="w-5 h-5 text-coral-500" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-forest-950 dark:text-ivory-50 tracking-tight">
              GapFinder <span className="text-coral-500">AI</span>
            </span>
            <span className="text-[10px] text-forest-600 dark:text-forest-400 block font-medium">
              Adaptive Knowledge Diagnostics
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-forest-950 dark:text-ivory-50">
              Welcome back
            </h1>
            <p className="text-xs text-forest-600 dark:text-forest-400 mt-1">
              Sign in with your registered account to continue your personalized learning journey.
            </p>
          </div>

          {/* Quick-Fill Sample Account Pill */}
          <div className="p-3 rounded-xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 shadow-paper flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <span className="text-[11px] text-forest-700 dark:text-forest-300">
                Stored demo user: <code className="font-mono font-semibold text-forest-900 dark:text-coral-400">student@gapfinder.ai</code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("student@gapfinder.ai");
                setPassword("password123");
                setAccountNotFound(false);
                setErrorMsg(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-coral-50 dark:bg-coral-950/50 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-800/60 hover:bg-coral-100 font-bold text-[11px] transition-colors"
            >
              Auto-fill
            </button>
          </div>

          {/* Account Not Stored in Database Alert - Prompts User to Create an Account */}
          {accountNotFound && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-sm block">
                    Account Not Stored in Database
                  </span>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    We could not find an account matching <strong className="font-semibold underline">{email}</strong> in our database. Please create an account to get started.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between flex-wrap gap-2">
                <Link
                  href={`/register?email=${encodeURIComponent(email)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-coral transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account for {email} →</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setAccountNotFound(false)}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Try different credentials
                </button>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && !accountNotFound && (
            <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-900/60 text-xs text-coral-800 dark:text-coral-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="block font-medium">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="email"
                  required
                  placeholder="student@gapfinder.ai"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (accountNotFound) setAccountNotFound(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 dark:focus:ring-coral-500 outline-none transition-colors shadow-paper"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-coral-600 dark:text-coral-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 dark:focus:ring-coral-500 outline-none transition-colors shadow-paper"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600 dark:hover:text-ivory-100"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-forest-700 dark:text-forest-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-coral-500 accent-coral-500"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-forest-950 hover:bg-black dark:bg-pine-900 dark:hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-forest-900 dark:border-pine-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying account credentials...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide">Sign In to Account</span>
                  <ArrowRight className="w-4 h-4 text-coral-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access & Register Option */}
          <div className="pt-4 border-t border-ivory-200 dark:border-pine-800 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ivory-200 dark:border-pine-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-forest-500">
                <span className="bg-ivory-50 dark:bg-pine-950 px-3">Instant Demo Mode</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 rounded-xl border border-forest-200 dark:border-pine-800 bg-white dark:bg-pine-900 hover:bg-forest-50/50 dark:hover:bg-pine-850 text-forest-900 dark:text-ivory-50 text-xs font-semibold shadow-paper transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              <span>Explore Demo Mode (Preloaded Networks Curriculum)</span>
            </button>

            <p className="text-center text-xs text-forest-600 dark:text-forest-400 pt-1">
              Don&apos;t have an account yet?{" "}
              <Link
                href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="font-bold text-coral-600 dark:text-coral-400 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-forest-950 dark:text-ivory-50">
              <KeyRound className="w-5 h-5 text-coral-500" />
              <h3 className="text-base font-bold">Reset Password</h3>
            </div>

            {resetStatus?.success ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{resetStatus.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(false);
                    setResetStatus(null);
                  }}
                  className="w-full py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-forest-600 dark:text-forest-400">
                  Enter your registered email address to receive a secure password recovery link.
                </p>

                {resetStatus?.message && !resetStatus.success && (
                  <div className="p-2.5 rounded-lg bg-coral-50 dark:bg-coral-950/40 border border-coral-200 text-xs text-coral-700 dark:text-coral-300">
                    {resetStatus.message}
                  </div>
                )}

                <input
                  type="email"
                  required
                  placeholder="student@gapfinder.ai"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-xs outline-none focus:ring-2 focus:ring-forest-600"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(false);
                      setResetStatus(null);
                    }}
                    className="px-3 py-1.5 text-xs text-forest-600 dark:text-forest-400 hover:text-forest-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-1.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
