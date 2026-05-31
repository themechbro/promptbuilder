"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import PackCard from "@/app/components/PackCard";
import CreatePackModal from "@/app/components/CreatePackModal";

const CATEGORIES = [
  "code-review",
  "writing",
  "analysis",
  "research",
  "debugging",
  "documentation",
  "planning",
  "data",
];

export default function CommunityPage() {
  const [tab, setTab] = useState("discover"); // discover | saved
  const [packs, setPacks] = useState([]);
  const [savedPacks, setSavedPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  const fetchPacks = useCallback(async (q = "", cat = "") => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "24", offset: "0" });
    if (cat) params.set("category", cat);
    if (q.trim().length >= 3) params.set("q", q.trim());

    const res = await fetch(`/api/packs?${params.toString()}`);
    const data = await res.json();
    if (res.ok) {
      setPacks(data.packs || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, []);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    const res = await fetch("/api/packs/saved");
    const data = await res.json();
    if (res.ok) setSavedPacks(data.packs || []);
    setLoadingSaved(false);
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  useEffect(() => {
    if (tab === "saved") fetchSaved();
  }, [tab, fetchSaved]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPacks(query, category);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, fetchPacks]);

  function handleCategoryClick(cat) {
    setCategory((prev) => (prev === cat ? "" : cat));
  }

  function handleSaveToggle(packId, isSaved) {
    // Update discover list
    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, is_saved: isSaved } : p)),
    );
    // Remove from saved list if unsaved
    if (!isSaved) {
      setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
    }
  }

  function handleDelete(packId) {
    setPacks((prev) => prev.filter((p) => p.id !== packId));
    setSavedPacks((prev) => prev.filter((p) => p.id !== packId));
  }

  function handleCreated(pack) {
    // Add to discover list immediately
    setPacks((prev) => [
      {
        ...pack,
        is_owner: true,
        is_saved: false,
        use_count: 0,
        protocol_components: [],
      },
      ...prev,
    ]);
  }

  const displayedPacks = tab === "discover" ? packs : savedPacks;
  const isLoadingCurrent = tab === "discover" ? loading : loadingSaved;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Community Hub</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Discover and share prompt packs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/advanced"
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors"
            >
              ← Studio
            </a>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              New Pack
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {["discover", "saved"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-white text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
              {t === "saved" && savedPacks.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  {savedPacks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Filters — only on discover */}
        {tab === "discover" && (
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search packs…"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    category === cat
                      ? "bg-white text-gray-900"
                      : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
                >
                  {cat.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pack grid */}
        {isLoadingCurrent ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading packs…</span>
          </div>
        ) : displayedPacks.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm">
              {tab === "saved"
                ? "No saved packs yet. Browse Discover to find some."
                : query || category
                  ? "No packs match your search."
                  : "No packs yet. Create the first one."}
            </p>
            {tab === "discover" && !query && !category && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Create a pack →
              </button>
            )}
          </div>
        ) : (
          <>
            {tab === "discover" && (
              <p className="text-gray-600 text-xs mb-4">
                {total} pack{total !== 1 ? "s" : ""}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  onSaveToggle={handleSaveToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <CreatePackModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
