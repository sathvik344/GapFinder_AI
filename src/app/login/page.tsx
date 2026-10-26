"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { signInUser, sendPasswordResetEmail, isSupabaseAuthConfigured } from "@/lib/auth";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  BrainCircuit,
  KeyRound,
  ShieldAlert,
  Target,
  Clock,
  Database,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/";

  const { user, loginDemo } = useAuth();
  const isConfigured = isSupabaseAuthConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);

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

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signInUser(cleanEmail, password, rememberMe);

      if (res.error === "SUPABASE_NOT_CONFIGURED") {
        setErrorMsg(
          "Supabase Auth is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable real database logins, or click below to explore via Demo Mode."
        );
      } else if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setSuccessMsg("Login successful! Redirecting to your dashboard...");
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
      if (res.error === "SUPABASE_NOT_CONFIGURED") {
        setResetStatus({
          success: false,
          message: "Supabase Auth is not configured. Add your credentials in .env.local.",
        });
      } else if (res.error) {
        setResetStatus({ success: false, message: res.error });
      } else {
        setResetStatus({
          success: true,
          message: "Password recovery link has been sent to your email address.",
        });
      }
    } catch (err: any) {
      setResetStatus({ success: false, message: err.message || "Failed to send reset email." });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Floating Theme Toggle (Always Available) */}
      <div className="absolute top-5 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Left Column: Educational Mastery & Analytics Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-950 p-12 text-white relative flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-violet-electric/15 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-electric flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xl tracking-tight">
                GapFinder <span className="text-teal-neon">AI</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-400/30">
                MVP
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Adaptive Knowledge Diagnostics & Spaced Revision
            </span>
          </div>
        </div>

        {/* Center: Topic Mastery Analytics Visualizer Card */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-neon" />
              <span>Evidence-Based Knowledge Audit</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Bridge your exam gaps with mathematical precision.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload your syllabus, textbooks, and past papers. GapFinder computes real topic mastery, pinpoints weak concepts below 60%, and schedules optimal revision slots.
            </p>
          </div>

          {/* Interactive Topic Mastery Sample Preview */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Live Knowledge Diagnostics</span>
              <span className="text-[11px] text-teal-neon font-semibold">CS401 Networks</span>
            </div>

            {/* Weak Topic Indicator */}
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-rose-300 block">TCP Congestion & AIMD</span>
                <span className="text-[10px] text-slate-400">Unit 4 • 3 missed diagnostic questions</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 block">54%</span>
                <span className="text-[9px] uppercase font-bold text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/60">
                  Weak
                </span>
              </div>
            </div>

            {/* Strong Topic Indicator */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-emerald-300 block">Dijkstra Link-State Algorithm</span>
                <span className="text-[10px] text-slate-400">Unit 3 • 4/4 correct past paper drills</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 block">88%</span>
                <span className="text-[9px] uppercase font-bold text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/60">
                  Strong
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today: 2h 15m Allocated</span>
              </span>
              <span className="text-indigo-300 font-medium">50% Allocated to Weak Topics</span>
            </div>
          </div>

          {/* Key Product Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <BrainCircuit className="w-4 h-4 text-violet-glow mb-1" />
              <span className="text-xs font-bold text-white block">Strict RAG Grounding</span>
              <span className="text-[11px] text-slate-400">Questions derived strictly from your files</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <Target className="w-4 h-4 text-teal-neon mb-1" />
              <span className="text-xs font-bold text-white block">Exact Citations</span>
              <span className="text-[11px] text-slate-400">Verifiable page & section references</span>
            </div>
          </div>
        </div>

        {/* Footer Reassurance */}
        <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Powered by Gemini 1.5 & Supabase pgvector</span>
          <span className="text-indigo-400 font-semibold">Next.js 14 App Router</span>
        </div>
      </div>

      {/* Right Column: Clean Centered Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {/* Mobile Brand Header */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-electric flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              GapFinder <span className="text-indigo-600 dark:text-teal-neon">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Adaptive Knowledge Diagnostics
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Continue your personalized learning and revision journey.
            </p>
          </div>

          {/* Actionable Supabase Configuration Guidance Banner */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">
                    Supabase Authentication Unconfigured
                  </span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                    To enable live database user accounts, add your project credentials to <code className="px-1 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/60 font-mono text-[10px]">.env.local</code>:
                  </p>
                  <p className="text-[10px] font-mono text-amber-800 dark:text-amber-400">
                    NEXT_PUBLIC_SUPABASE_URL<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                  Testing or grading the MVP?
                </span>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                >
                  Explore in Demo Mode →
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
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="block font-medium">{errorMsg}</span>
                {!isConfigured && (
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="text-xs font-bold text-rose-900 dark:text-rose-200 underline hover:no-underline block pt-1"
                  >
                    Click here to sign in with Demo Mode instead →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-teal-neon hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-600 dark:accent-indigo-500"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-electric hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Separated Demo Access (Clearly Labeled) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-slate-50 dark:bg-navy-900 px-3">Quick Demo Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon" />
              <span>Explore Demo Mode (Preloaded Networks Curriculum)</span>
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-bold text-indigo-600 dark:text-teal-neon hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <KeyRound className="w-5 h-5 text-indigo-600 dark:text-teal-neon" />
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
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered email address to receive a secure password recovery link.
                </p>

                {resetStatus?.message && !resetStatus.success && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                    {resetStatus.message}
                  </div>
                )}

                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(false);
                      setResetStatus(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
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
