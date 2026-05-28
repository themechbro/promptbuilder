"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { LogOut } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo/icon.png";
import { Scale, Cpu, Library, Globe } from "lucide-react";
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

  // // Render static navbar until client mounts
  // if (!mounted) {
  //   return (
  //     <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
  //       <div className="flex items-center gap-2">
  //         <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent gap-2 flex flex-row">
  //           <Image
  //             src={logo}
  //             width={20}
  //             height={20}
  //             alt="Prompt Builder Logo"
  //             className="rounded-full"
  //           />
  //           Prompt Builder
  //         </span>
  //         <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
  //           v2.2.0
  //         </span>
  //       </div>
  //       <nav className="flex items-center gap-6">
  //         <Link
  //           href="/"
  //           className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
  //         >
  //           Standard
  //         </Link>
  //       </nav>
  //     </header>
  //   );
  // }

  // return (
  //   <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
  //     <div className="flex items-center gap-2">
  //       <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex flex-row gap-2">
  //         <Image
  //           src={logo}
  //           width={30}
  //           height={30}
  //           alt="Prompt Builder Logo"
  //           className="rounded-full"
  //         />{" "}
  //         Prompt Builder
  //       </span>
  //       <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
  //         v2.2.0
  //       </span>
  //     </div>

  //     <nav className="flex items-center gap-6">
  //       <Link
  //         href="/"
  //         className="text-sm font-medium px-3 py-1.5 bg-blue-600/20 text-slate-400 hover:text-slate-200 transition-colors rounded border border-blue-500/30 transition-all flex flex-row gap-2"
  //       >
  //         <Scale /> Standard
  //       </Link>

  //       {!loading && (
  //         <>
  //           {user ? (
  //             <>
  //               <Link
  //                 href="/advanced"
  //                 className="text-sm font-medium px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all"
  //               >
  //                 <Cpu />
  //                 Advanced Studio
  //               </Link>
  //               <button
  //                 onClick={handleLogout}
  //                 className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
  //               >
  //                 <LogOut size={15} />
  //                 Logout
  //               </button>
  //             </>
  //           ) : (
  //             <Link
  //               href="/auth/login"
  //               className="text-sm font-medium px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all"
  //             >
  //               Advanced Studio
  //             </Link>
  //           )}
  //         </>
  //       )}
  //     </nav>
  //   </header>
  // );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/40">
      <div className="flex items-center justify-between h-16 px-4 mx-auto md:px-6 max-w-7xl">
        {/* Brand & Logo Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group outline-none"
          >
            <div className="relative flex shrink-0 items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-slate-700/60 shadow-sm group-hover:border-indigo-500/50 transition-colors">
              <Image
                src={logo}
                alt="Prompt Builder Logo"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              Prompt Builder
            </span>
          </Link>

          <div className="hidden sm:flex items-center px-2 py-0.5 rounded-md bg-slate-800/40 border border-slate-700/50">
            <span className="text-[11px] font-mono font-medium tracking-wide text-slate-400">
              v2.4.0
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center gap-1.5 md:gap-3">
          {/* Standard Tier */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Standard</span>
          </Link>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-800/80 mx-1 md:mx-2" />

          {/* Dynamic Auth Section */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            {!mounted || loading ? (
              // Skeleton Loader
              <div className="w-32 h-8 bg-slate-800/40 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                {/* Authenticated: Subtle Ghost Style */}
                <Link
                  href="/advanced"
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Advanced Studio</span>
                </Link>
                <Link
                  href="/manage"
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:bg-slate-700/50 hover:border-slate-600/60 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                >
                  <Library className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">My Vault</span>
                </Link>

                <Link
                  href="/community"
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800/40 border border-slate-700/40 hover:bg-slate-700/50 hover:border-slate-600/60 rounded-lg transition-all"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Community</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center justify-center p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </>
            ) : (
              // Unauthenticated: Solid Primary CTA Style leading to login
              <Link
                href="/auth/login"
                className="group flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Advanced Studio</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
