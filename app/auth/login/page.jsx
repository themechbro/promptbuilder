"use client";
import { supabase } from "@/utils/supabaseClient";

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
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="border border-slate-800 bg-slate-900/30 p-8 rounded-xl flex flex-col items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-200">Prompt Builder</h1>
        <p className="text-sm text-slate-400">
          Sign in to access your component vault
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-xs text-slate-300 white-space">
          Note:- Due to technical Limitation, only Google Sigin is available.
          Rest be sure, that your data like email, name and all aint going to
          third party. If Supabase sells then it's on them.
        </p>
      </div>
    </div>
  );
}
