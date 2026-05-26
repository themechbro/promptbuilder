"use client";
import { supabase } from "@/utils/supabaseClient";
import { Info, Cpu } from "lucide-react";

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col items-center gap-8">
        {/* NEW: Contextual Up-sell Banner */}
        <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-indigo-200/90 leading-tight">
            Sign in to unlock the{" "}
            <span className="text-indigo-400 font-semibold">
              Advanced Studio
            </span>{" "}
            features.
          </p>
        </div>

        {/* Header Section */}
        <div className="space-y-2 text-center mt-[-8px]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Prompt Builder
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to access your component vault
          </p>
        </div>

        {/* Action Section */}
        <button
          onClick={handleGoogleSignIn}
          className="group relative flex items-center justify-center gap-3 w-full px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {/* Official Google 'G' Logo SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Disclaimer Callout */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-left leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">Note:</span> Due to
            technical limitations, only Google Sign-In is available. Rest
            assured, your personal data isn't shared with third parties.{" "}
            <span className="italic opacity-70">
              (If Supabase sells, that's on them.)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
