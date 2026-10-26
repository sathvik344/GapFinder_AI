"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { signUpUser, isSupabaseAuthConfigured } from "@/lib/auth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Compass,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/";
  const paramEmail = searchParams?.get("email") || "";

  const { user, loginDemo } = useAuth();
  const isConfigured = isSupabaseAuthConfigured();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  useEffect(() => {
    if (paramEmail && !email) {
      setEmail(paramEmail);
    }
  }, [paramEmail, email]);

  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setAlreadyExists(false);

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

      if (res.code === "ACCOUNT_ALREADY_EXISTS") {
        setAlreadyExists(true);
        setErrorMsg("An account with this email already exists in our database. Please sign in instead.");
      } else if (res.error) {
        setErrorMsg(res.error);
      } else if (res.confirmationRequired) {
        setSuccessMsg(
          "Registration successful! A confirmation link was sent to your email. Please verify your address before logging in."
        );
      } else if (res.user) {
        setSuccessMsg("Account created successfully in database! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(redirectPath);
        }, 700);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-ivory-50 dark:bg-pine-950 text-forest-900 dark:text-ivory-50 transition-colors duration-200">
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Left Column: Educational Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-950 p-12 text-ivory-50 relative flex-col justify-between overflow-hidden border-r border-forest-850">
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
              Personalized Knowledge Audit Platform
            </span>
          </div>
        </div>

        {/* Center: Educational Workflow Preview */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/90 border border-forest-750 text-forest-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-coral-400" />
              <span>Personalized Student Journey</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-ivory-50">
              Smarter exam preparation from day one.
            </h2>
            <p className="text-xs text-forest-200 leading-relaxed">
              Create your account to unlock private document processing, RAG-grounded topic maps, dynamic gap analysis reports, and adaptive revision schedules.
            </p>
          </div>

          {/* Workflow Steps Card */}
          <div className="p-4 rounded-2xl bg-forest-900/70 border border-forest-800 backdrop-blur-md space-y-3 shadow-xl">
            <span className="text-xs font-bold text-ivory-100 block mb-1">How GapFinder Operates</span>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-forest-850/60 border border-forest-750">
              <div className="w-6 h-6 rounded-lg bg-coral-500/20 text-coral-400 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <span className="text-xs font-bold text-ivory-100 block">Ingest Syllabus & Materials</span>
                <span className="text-[11px] text-forest-300">PDFs and notes parsed with page & section metadata</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-forest-850/60 border border-forest-750">
              <div className="w-6 h-6 rounded-lg bg-coral-500/20 text-coral-400 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <span className="text-xs font-bold text-ivory-100 block">Take RAG Diagnostic Quiz</span>
                <span className="text-[11px] text-forest-300">Questions synthesized strictly from retrieved context chunks</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-forest-850/60 border border-forest-750">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <span className="text-xs font-bold text-ivory-100 block">Execute Spaced Revision Plan</span>
                <span className="text-[11px] text-forest-300">50% study time targeted to weak topics (&lt;60%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-forest-900/50 border border-forest-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-ivory-100 block">Document Isolation</span>
              <span className="text-[11px] text-forest-300">Database user accounts</span>
            </div>
            <div className="p-3 rounded-xl bg-forest-900/50 border border-forest-800">
              <FileCheck className="w-4 h-4 text-coral-400 mb-1" />
              <span className="text-xs font-bold text-ivory-100 block">Audit Evidence</span>
              <span className="text-[11px] text-forest-300">Verifiable quiz score logs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-forest-850 text-[11px] text-forest-400 flex items-center justify-between">
          <span>Stored Database & Live Supabase PostgreSQL Ready</span>
          <span className="text-coral-400 font-semibold">Next.js 14 App Router</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-forest-900 flex items-center justify-center text-ivory-50 shadow-md">
            <Compass className="w-5 h-5 text-coral-500" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-forest-950 dark:text-ivory-50 tracking-tight">
              GapFinder <span className="text-coral-500">AI</span>
            </span>
            <span className="text-[10px] text-forest-600 dark:text-forest-400 block font-medium">
              Create Student Account
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-forest-950 dark:text-ivory-50">
              Create an Account
            </h1>
            <p className="text-xs text-forest-600 dark:text-forest-400 mt-1">
              Start diagnosing your knowledge gaps and building your personalized revision schedule.
            </p>
          </div>

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
                  className="px-3 py-1 rounded-lg bg-coral-500 text-white font-semibold text-xs shadow-xs hover:bg-coral-600"
                >
                  Proceed to Sign In →
                </Link>
              </div>
            </div>
          )}

          {/* Account Already Exists Alert */}
          {alreadyExists && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="block font-medium">
                  An account with <strong>{email}</strong> already exists in our database.
                </span>
                <Link
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="inline-block font-bold text-coral-600 dark:text-coral-400 underline hover:no-underline pt-0.5"
                >
                  Sign in with this account instead →
                </Link>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && !alreadyExists && (
            <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-900/60 text-xs text-coral-800 dark:text-coral-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="block font-medium">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 outline-none transition-colors shadow-paper"
                />
              </div>
            </div>

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
                    if (alreadyExists) setAlreadyExists(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 outline-none transition-colors shadow-paper"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 outline-none transition-colors shadow-paper"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200">
                    Confirm Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[10px] font-bold ${
                        passwordsMatch ? "text-emerald-600" : "text-coral-500"
                      }`}
                    >
                      {passwordsMatch ? "Matches" : "Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                      confirmPassword.length > 0 && !passwordsMatch
                        ? "border-coral-400"
                        : "border-ivory-200 dark:border-pine-800"
                    } bg-white dark:bg-pine-900 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-forest-600 outline-none transition-colors shadow-paper`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-forest-950 hover:bg-black dark:bg-pine-900 dark:hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 border border-forest-900 dark:border-pine-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering account in database...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide">Create Student Account</span>
                  <ArrowRight className="w-4 h-4 text-coral-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
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
              <span>Explore Demo Mode without Registration</span>
            </button>

            <p className="text-center text-xs text-forest-600 dark:text-forest-400 pt-1">
              Already have an account?{" "}
              <Link
                href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="font-bold text-coral-600 dark:text-coral-400 hover:underline"
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
