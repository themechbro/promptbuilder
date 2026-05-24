"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { LogOut } from "lucide-react";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Render static navbar until client mounts
  if (!mounted) {
    return (
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Prompt Builder
          </span>
          <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
            v1.3.0
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Standard
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Prompt Builder
        </span>
        <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
          v1.3.0
        </span>
      </div>

      <nav className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          Standard
        </Link>

        {!loading && (
          <>
            {user ? (
              <>
                <Link
                  href="/advanced"
                  className="text-sm font-medium px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all"
                >
                  Advanced Studio
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all"
              >
                Advanced Studio
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
