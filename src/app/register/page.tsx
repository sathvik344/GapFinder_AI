"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { signUpUser, isSupabaseAuthConfigured } from "@/lib/auth";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  BookOpen,
  Database,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/";

  const { user, loginDemo } = useAuth();
  const isConfigured = isSupabaseAuthConfigured();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid academic or personal email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setLoading(true);

    try {
      const res = await signUpUser(cleanName, cleanEmail, password);

      if (res.error === "SUPABASE_NOT_CONFIGURED") {
        setErrorMsg(
          "Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable live database registration, or launch Demo Mode below."
        );
      } else if (res.error) {
        setErrorMsg(res.error);
      } else if (res.confirmationRequired) {
        setSuccessMsg(
          "Registration successful! We have sent a confirmation link to your email. Please verify your address before logging in."
        );
      } else if (res.user) {
        setSuccessMsg("Account created successfully! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(redirectPath);
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemo(name.trim() || "Student Evaluator", email.trim() || "evaluator@gapfinder.ai");
    router.push(redirectPath);
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Left Column: Educational Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-950 p-12 text-white relative flex-col justify-between overflow-hidden border-r border-slate-800">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-teal-electric/15 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-electric flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xl tracking-tight">
                GapFinder <span className="text-teal-neon">AI</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-neon/20 text-teal-300 font-semibold border border-teal-neon/30">
                MVP
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Personalized Knowledge Audit Platform
            </span>
          </div>
        </div>

        {/* Center: Educational Workflow Preview */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-electric/20 border border-teal-electric/30 text-teal-neon text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Student Journey</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Smarter exam preparation from day one.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create your account to unlock private document processing, RAG-grounded topic maps, dynamic gap analysis reports, and adaptive revision schedules.
            </p>
          </div>

          {/* Workflow Steps Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3 shadow-xl">
            <span className="text-xs font-bold text-slate-200 block mb-1">How GapFinder Operates</span>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03]">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Ingest Syllabus & Materials</span>
                <span className="text-[11px] text-slate-400">PDFs and notes parsed with page & section metadata</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03]">
              <div className="w-6 h-6 rounded-lg bg-violet-electric/30 text-violet-glow flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Take RAG Diagnostic Quiz</span>
                <span className="text-[11px] text-slate-400">Questions synthesized strictly from retrieved context chunks</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03]">
              <div className="w-6 h-6 rounded-lg bg-teal-electric/30 text-teal-neon flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Execute Spaced Revision Plan</span>
                <span className="text-[11px] text-slate-400">50% study time targeted to weak topics (&lt;60%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white block">Document Isolation</span>
              <span className="text-[11px] text-slate-400">Supabase Row-Level Security</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <FileCheck className="w-4 h-4 text-teal-neon mb-1" />
              <span className="text-xs font-bold text-white block">Audit Evidence</span>
              <span className="text-[11px] text-slate-400">Verifiable quiz score logs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Supported by Gemini 1.5 & Supabase pgvector</span>
          <span className="text-indigo-400 font-semibold">Next.js 14 App Router</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-electric flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              GapFinder <span className="text-indigo-600 dark:text-teal-neon">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Create Student Account
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create an Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start diagnosing your gaps and building your personalized revision schedule.
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

          {/* Success Alert */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMsg}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-end">
                <Link
                  href="/login"
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700"
                >
                  Proceed to Sign In →
                </Link>
              </div>
            </div>
          )}

          {/* Error Alert */}
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
                    Click here to enter with Demo Mode instead →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[10px] font-bold ${
                        passwordsMatch ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {passwordsMatch ? "Matches" : "Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "border-rose-400 dark:border-rose-500/70"
                        : "border-slate-200 dark:border-slate-800"
                    } bg-white dark:bg-navy-850 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-colors`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-electric hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering account in Supabase...</span>
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-slate-50 dark:bg-navy-900 px-3">Instant Demo Mode</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon" />
              <span>Explore Demo Mode without Registration</span>
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 dark:text-teal-neon hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
