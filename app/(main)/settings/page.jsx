"use client";
import { useEffect, useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  X,
} from "lucide-react";

const MCP_CLIENTS = [
  { id: "claude-desktop", label: "Claude Desktop" },
  { id: "cursor", label: "Cursor" },
  { id: "windsurf", label: "Windsurf" },
];

const MCP_FILE_PATHS = {
  "claude-desktop": {
    macos: [
      {
        label: null,
        path: "~/Library/Application Support/Claude/claude_desktop_config.json",
      },
    ],
    windows: [
      {
        label: "Installed via .exe installer",
        path: "%APPDATA%\\Claude\\claude_desktop_config.json",
      },
      {
        label: "Installed via Microsoft Store / WinGet",
        path: "%LOCALAPPDATA%\\Packages\\Claude_pzs8sxrjxfjjc\\LocalCache\\Roaming\\Claude\\claude_desktop_config.json",
      },
    ],
  },
  cursor: {
    macos: [{ label: null, path: "~/.cursor/mcp.json" }],
    windows: [{ label: null, path: "~/.cursor/mcp.json" }],
  },
  windsurf: {
    macos: [{ label: null, path: "~/.codeium/windsurf/mcp_config.json" }],
    windows: [{ label: null, path: "~/.codeium/windsurf/mcp_config.json" }],
  },
};

function generateMcpConfig(rawKey, os) {
  const isWindows = os === "windows";

  return JSON.stringify(
    {
      mcpServers: {
        promptbuilder: {
          command: isWindows ? "promptbuilder-mcp" : "npx",
          args: isWindows
            ? ["--key", rawKey]
            : ["-y", "promptbuilder-mcp", "--key", rawKey],
        },
      },
    },
    null,
    2,
  );
}

function McpConfigBlock({ rawKey }) {
  const [selectedClient, setSelectedClient] = useState("claude-desktop");
  const [selectedOS, setSelectedOS] = useState("macos");
  const [copiedConfig, setCopiedConfig] = useState(false);

  const config = generateMcpConfig(rawKey, selectedOS);
  const filePaths = MCP_FILE_PATHS[selectedClient][selectedOS];

  function handleCopyConfig() {
    navigator.clipboard.writeText(config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-mono text-slate-400">
        MCP Config — paste into your client
      </p>

      {/* Client selector */}
      <div className="flex gap-2 flex-wrap">
        {MCP_CLIENTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClient(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              selectedClient === c.id
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* OS selector */}
      <div className="flex gap-2">
        {["macos", "windows"].map((os) => (
          <button
            key={os}
            onClick={() => setSelectedOS(os)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              selectedOS === os
                ? "bg-slate-700 border-slate-500 text-slate-200"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
            }`}
          >
            {os === "macos" ? "macOS" : "Windows"}
          </button>
        ))}
      </div>

      {/* Windows install warning — shown BEFORE config, not after */}
      {selectedOS === "windows" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs font-mono text-amber-300 leading-relaxed">
            Run this in PowerShell first — npx is unreliable on Windows:
            <br />
            <code className="text-amber-200">
              npm install -g promptbuilder-mcp
            </code>
          </p>
        </div>
      )}

      {/* Config output */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
        <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
          {config}
        </pre>
        <button
          onClick={handleCopyConfig}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors"
        >
          {copiedConfig ? (
            <Check size={11} className="text-emerald-400" />
          ) : (
            <Copy size={11} />
          )}
          {copiedConfig ? "Copied" : "Copy"}
        </button>
      </div>

      {/* File path(s) — Claude Desktop on Windows has two possible paths */}
      <div className="flex flex-col gap-2">
        {filePaths.map((fp, i) => (
          <div key={i} className="flex flex-col gap-1 min-w-0">
            {fp.label && (
              <span className="text-xs font-mono text-slate-500">
                {fp.label}:
              </span>
            )}
            <code className="text-xs font-mono text-slate-400 break-all leading-relaxed bg-slate-900 px-2 py-1.5 rounded block w-full min-w-0">
              {fp.path}
            </code>
          </div>
        ))}
        {filePaths.length > 1 && (
          <p className="text-xs text-slate-600 italic">
            Not sure which? Only one of these will exist on your system.
          </p>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors"
    >
      {copied ? (
        <Check size={12} className="text-emerald-400" />
      ) : (
        <Copy size={12} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function NewKeyModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawKey, setRawKey] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate key.");
        return;
      }

      setRawKey(data.rawKey);
      onCreated(data.key);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Raw key reveal — shown once only
  if (rawKey) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={16} />
            <h2 className="text-sm font-semibold font-mono">Key Generated</h2>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertTriangle
              size={14}
              className="text-amber-400 mt-0.5 shrink-0"
            />
            <p className="text-xs text-amber-300 font-mono leading-relaxed">
              Copy this key now. You will never see it again — we only store a
              hash.
            </p>
          </div>

          {/* Raw key */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <code className="text-xs text-indigo-300 font-mono break-all">
              {rawKey}
            </code>
            <CopyButton text={rawKey} />
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800" />

          {/* MCP Config — collapsed by default to keep key reveal focused */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 text-left"
          >
            {showConfig ? "− Hide" : "+ Show"} MCP config for this key
          </button>

          {showConfig && <McpConfigBlock rawKey={rawKey} />}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            I've saved my key — close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 font-mono">
            GENERATE API KEY
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-400">Key Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. Claude Desktop, Cursor"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-600">
              Use a name that identifies where this key will be used.
            </p>
          </div>

          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!name.trim() || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Generate Key
          </button>
        </div>
      </div>
    </div>
  );
}

function KeyRow({ apiKey, onRevoke }) {
  const [revoking, setRevoking] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleRevoke = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setRevoking(true);
    try {
      const res = await fetch(`/api/keys/${apiKey.id}`, { method: "DELETE" });
      if (res.ok) onRevoke(apiKey.id);
    } catch {
      // silently fail — user can retry
    } finally {
      setRevoking(false);
      setConfirm(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Key size={13} className="text-indigo-400" />
            <span className="text-sm font-mono font-medium text-slate-200">
              {apiKey.name}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700">
              {apiKey.key_prefix}...
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
              <Clock size={10} />
              Created {formatDate(apiKey.created_at)}
            </span>
            <span className="text-xs font-mono text-slate-600">
              Last used: {formatDate(apiKey.last_used_at)}
            </span>
          </div>
        </div>

        <button
          onClick={handleRevoke}
          disabled={revoking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
            confirm
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-400"
          }`}
        >
          {revoking ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Trash2 size={11} />
          )}
          {confirm ? "Confirm Revoke" : "Revoke"}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {apiKey.scopes.map((scope) => (
          <span
            key={scope}
            className="text-xs font-mono px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded"
          >
            {scope}
          </span>
        ))}
      </div>
    </div>
  );
}

function McpConfigGenerator() {
  const [pastedKey, setPastedKey] = useState("");

  const isValidKey = pastedKey.startsWith("pb_") && pastedKey.length > 10;

  return (
    <div className="mt-10 border-t border-slate-800 pt-8 flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold font-mono text-slate-200">
          Connect to MCP Client
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Generate a config for Claude Desktop, Cursor, or Windsurf.
        </p>
      </div>

      {/* Key input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-slate-400">API Key</label>
        <input
          type="password"
          placeholder="Paste your API key (pb_...)"
          value={pastedKey}
          onChange={(e) => setPastedKey(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
        />
        <p className="text-xs text-slate-600">
          Key is never sent anywhere — config is generated locally in your
          browser.
        </p>
      </div>

      {/* Config block — only when key is valid */}
      {isValidKey && <McpConfigBlock rawKey={pastedKey} />}
    </div>
  );
}

export default function SettingsPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch("/api/keys");
        const data = await res.json();
        if (res.ok) setKeys(data.keys || []);
      } finally {
        setLoading(false);
      }
    };

    fetchKeys();
  }, []);

  const handleCreated = (newKey) => {
    setKeys((prev) => [newKey, ...prev]);
  };

  const handleRevoke = (id) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold font-mono text-slate-100">
              API Keys
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Use these keys to access your vault from external tools like
              Claude Desktop or Cursor.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={keys.length >= 10}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            New Key
          </button>
        </div>

        {/* Usage note */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
          <ShieldCheck size={14} className="text-indigo-400 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-mono text-slate-300">
              Keys are write-protected. They can only read your public
              components and packs.
            </p>
            <p className="text-xs font-mono text-slate-600">
              Maximum 10 keys per account. Raw key is shown once on creation —
              store it securely.
            </p>
          </div>
        </div>

        {/* Keys list */}
        <div className="flex flex-col gap-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-xs font-mono">Loading keys...</span>
            </div>
          )}

          {!loading && keys.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <Key size={24} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-mono text-slate-500">
                No API keys yet.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Generate one to connect external tools to your vault.
              </p>
            </div>
          )}

          {!loading &&
            keys.map((key) => (
              <KeyRow key={key.id} apiKey={key} onRevoke={handleRevoke} />
            ))}
        </div>

        {keys.length >= 10 && (
          <p className="text-xs text-amber-400 font-mono mt-4 text-center">
            Maximum of 10 keys reached. Revoke an existing key to create a new
            one.
          </p>
        )}

        {/* MCP Config Generator — returning users */}
        <McpConfigGenerator />
      </div>

      {showModal && (
        <NewKeyModal
          onClose={() => setShowModal(false)}
          onCreated={(key) => {
            handleCreated(key);
            // Modal stays open to show raw key — closes on user confirmation
          }}
        />
      )}
    </div>
  );
}
