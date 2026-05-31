"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "@/utils/supabaseClient";
import { compilePromptKitBlueprint } from "@/utils/promptCompiler";
import CreateComponentModal from "@/app/components/CreateComponentModal";
import {
  Plus,
  Copy,
  Download,
  Check,
  ListRestart,
  Play,
  Send,
  Loader2,
  X,
  Sparkles,
  Brain,
  GitBranch,
  LayoutTemplate,
  FileCode2,
  Layers,
  FileText,
  Braces,
  Zap,
  Variable,
  PackageOpen,
  Boxes,
} from "lucide-react";
import SelectComponentModal from "@/app/components/SelectComponentModal";
import localforage from "localforage";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import TourTooltip from "@/app/components/TourTooltip";
import ChainBuilder from "@/app/components/ChainBuilder";
function PackLoader({ onLoad }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const personaId = searchParams.get("persona_id");
    const protocolId = searchParams.get("protocol_id");
    const formatId = searchParams.get("format_id");
    const templateId = searchParams.get("template_id");

    if (!personaId && !protocolId && !formatId && !templateId) return;

    const ids = [personaId, protocolId, formatId, templateId].filter(Boolean);

    supabase
      .from("prompt_components")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        onLoad({
          persona: data.find((c) => c.id === personaId) || null,
          protocol: data.find((c) => c.id === protocolId) || null,
          format: data.find((c) => c.id === formatId) || null,
          template: data.find((c) => c.id === templateId) || null,
        });
      });
  }, [searchParams]);

  return null;
}

export default function AdvancedStudio() {
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState({});
  const [compiledOutput, setCompiledOutput] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fallback testing states (We will link these to Supabase fetches later)
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const detectedVars = [
    ...new Set(
      [...template.matchAll(/{{([a-zA-Z0-9_-]+)}}/g)].map((m) => m[1]),
    ),
  ];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectModal, setSelectModal] = useState(null); // stores active type e.g. "persona"
  const [activeRightTab, setActiveRightTab] = useState("output");
  const [history, setHistory] = useState([]);
  const [promptVersions, setPromptVersions] = useState({});

  // Sandbox States
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    openai: "",
    anthropic: "",
  });
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const conversationEndRef = useRef(null);

  // Semantic Search States
  const [suggestions, setSuggestions] = useState({
    persona: [],
    protocol: [],
    format: [],
  });
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const lastQueryRef = useRef("");
  // Tour
  const [tourUser, setTourUser] = useState(null);

  const handleCompile = () => {
    try {
      setError(null);
      const payload = {
        persona: selectedPersona,
        protocol: selectedProtocol,
        format: selectedFormat,
        template: { content: template },
        variables: variables,
      };
      const result = compilePromptKitBlueprint(payload);
      setCompiledOutput(result);
      handleSaveToHistory(result); // add this
    } catch (err) {
      setError(err.message);
      setCompiledOutput(null);
    }
  };

  const handleComponentCreated = (component) => {
    console.log("Created:", component);
    // Will use this later when selector modal is built
  };

  const handleComponentSelected = (type, component) => {
    if (type === "persona") setSelectedPersona(component);
    if (type === "protocol") setSelectedProtocol(component);
    if (type === "format") setSelectedFormat(component);
    if (type === "template") {
      setSelectedTemplate(component);
      setTemplate(component.content); // auto-populate textarea
      setVariables({});
    }
  };

  // Add handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(compiledOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(compiledOutput, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiled-blueprint.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToHistory = (compiledResult) => {
    if (!compiledResult) return;
    setHistory((prev) => {
      const compiledString = JSON.stringify(compiledResult);

      // Prevent duplicate consecutive entries
      if (prev[0]?.prompt === compiledString) return prev;

      const newEntry = {
        id: crypto.randomUUID(),
        category: selectedTemplate?.name || "Custom Prompt",
        categoryId: selectedTemplate?.slug || "custom",
        prompt: compiledString,
        chainContext: "",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        formValues: { ...variables },
        persona: selectedPersona?.name || null,
        protocol: selectedProtocol?.name || null,
        format: selectedFormat?.name || null,
      };

      const updated = [newEntry, ...prev].slice(0, 25);
      localforage.setItem("prompt_builder_advanced_history", updated);
      return updated;
    });

    setPromptVersions((prev) => {
      if (!selectedTemplate) return prev;
      const slug = selectedTemplate.slug;
      const compiledString = JSON.stringify(compiledResult);
      const currentVersions = prev[slug] || [];
      if (currentVersions[0] === compiledString) return prev;
      return {
        ...prev,
        [slug]: [compiledString, ...currentVersions].slice(0, 3),
      };
    });
  };

  const handleReset = () => {
    setSelectedPersona(null);
    setSelectedProtocol(null);
    setSelectedFormat(null);
    setSelectedTemplate(null);
    setTemplate("");
    setVariables({});
    setCompiledOutput(null);
    setError(null);
    setSuggestions({ persona: [], protocol: [], format: [] });
    setHasSuggestions(false);
    lastQueryRef.current = "";
  };

  const handleSaveChatSession = (updatedConversation) => {
    if (!updatedConversation.length || !compiledOutput) return;

    setChatSessions((prev) => {
      // Update existing session or create new one
      const existingIndex = prev.findIndex((s) => s.id === activeChatId);

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          conversation: updatedConversation,
          updatedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        localforage.setItem("prompt_builder_advanced_chats", updated);
        return updated;
      }

      const newSession = {
        id: activeChatId || crypto.randomUUID(),
        title: selectedTemplate?.name || "Custom Session",
        model: selectedModel,
        persona: selectedPersona?.name || null,
        protocol: selectedProtocol?.name || null,
        format: selectedFormat?.name || null,
        compiledOutput: compiledOutput,
        conversation: updatedConversation,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (!activeChatId) setActiveChatId(newSession.id);
      const updated = [newSession, ...prev].slice(0, 20);
      localforage.setItem("prompt_builder_advanced_chats", updated);
      return updated;
    });
  };

  // Sandbox
  const handleSend = async (isFirstMessage = false) => {
    const currentKey = apiKeys[selectedModel];
    if (!currentKey?.trim()) return;

    const messageToSend = isFirstMessage ? null : userInput;
    if (!isFirstMessage && !messageToSend?.trim()) return;

    // Build messages array
    let messages;
    if (isFirstMessage) {
      messages = compiledOutput;
      setConversation([]);
    } else {
      messages = [
        ...compiledOutput,
        ...conversation.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userInput },
      ];
      setConversation((prev) => [
        ...prev,
        { role: "user", content: userInput },
      ]);
      setUserInput("");
    }

    setIsStreaming(true);
    setStreamingText("");
    setMetrics(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel,
          apiKey: currentKey.trim(),
          messages,
        }),
      });

      if (!response.ok) {
        const err = await response.json();

        let errorMessage = `Error: ${err.error}`;

        if (response.status === 429) {
          const retryAfter = err.retryAfter || 60;
          errorMessage = `Rate limit hit — too many requests. Try again in ${retryAfter} seconds.`;
        }

        setConversation((prev) => [
          ...prev,
          { role: "assistant", content: errorMessage },
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        if (chunk.includes("__STREAM_METRICS__")) {
          const parts = chunk.split("__STREAM_METRICS__");
          fullText += parts[0];
          setStreamingText(fullText);
          try {
            setMetrics(JSON.parse(parts[1]));
          } catch {}
        } else {
          fullText += chunk;
          setStreamingText(fullText);
        }
      }

      setConversation((prev) => {
        const updated = [...prev, { role: "assistant", content: fullText }];
        handleSaveChatSession(updated); // add this
        return updated;
      });
      setStreamingText("");
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewChat = () => {
    setConversation([]);
    setActiveChatId(crypto.randomUUID());
    setStreamingText("");
    setMetrics(null);
    setUserInput("");
  };

  const handleResumeChat = (session) => {
    setCompiledOutput(session.compiledOutput);
    setConversation(session.conversation);
    setSelectedModel(session.model);
    setActiveChatId(session.id);
    setActiveRightTab("run");
  };

  const handleDeleteChat = (sessionId, e) => {
    e.stopPropagation();
    setChatSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      localforage.setItem("prompt_builder_advanced_chats", updated);
      return updated;
    });
    if (activeChatId === sessionId) {
      setActiveChatId(null);
      setConversation([]);
    }
  };

  useEffect(() => {
    localforage.getItem("prompt_builder_advanced_history").then((saved) => {
      if (saved) setHistory(saved);
    });
  }, []);

  // Sandbox
  useEffect(() => {
    setApiKeys({
      gemini: sessionStorage.getItem("sandbox_sk_gemini") || "",
      openai: sessionStorage.getItem("sandbox_sk_openai") || "",
      anthropic: sessionStorage.getItem("sandbox_sk_anthropic") || "",
    });
  }, []);
  useEffect(() => {
    localforage.getItem("prompt_builder_advanced_chats").then((saved) => {
      if (saved) setChatSessions(saved);
    });
    // existing history load
    localforage.getItem("prompt_builder_advanced_history").then((saved) => {
      if (saved) setHistory(saved);
    });
    // existing api keys load
    setApiKeys({
      gemini: sessionStorage.getItem("sandbox_sk_gemini") || "",
      openai: sessionStorage.getItem("sandbox_sk_openai") || "",
      anthropic: sessionStorage.getItem("sandbox_sk_anthropic") || "",
    });
  }, []);
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, streamingText]);

  // Semantic Search
  useEffect(() => {
    if (!template || template.trim().length < 40) {
      setSuggestions({ persona: [], protocol: [], format: [] });
      setHasSuggestions(false);
      return;
    }

    // Skip if query hasn't changed significantly (less than 10 new chars)
    const currentQuery = template.trim();
    if (
      Math.abs(currentQuery.length - lastQueryRef.current.length) < 10 &&
      lastQueryRef.current !== ""
    ) {
      return;
    }

    const debounce = setTimeout(async () => {
      lastQueryRef.current = currentQuery;
      setIsFetchingSuggestions(true);
      try {
        const [personaRes, protocolRes, formatRes] = await Promise.all([
          fetch("/api/components/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: currentQuery,
              type: "persona",
              threshold: 0.3,
              count: 3,
            }),
          }),
          fetch("/api/components/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: currentQuery,
              type: "protocol",
              threshold: 0.3,
              count: 3,
            }),
          }),
          fetch("/api/components/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: currentQuery,
              type: "format",
              threshold: 0.3,
              count: 3,
            }),
          }),
        ]);

        const personaData = personaRes.ok
          ? await personaRes.json()
          : { results: [] };
        const protocolData = protocolRes.ok
          ? await protocolRes.json()
          : { results: [] };
        const formatData = formatRes.ok
          ? await formatRes.json()
          : { results: [] };

        setSuggestions({
          persona: personaData.results || [],
          protocol: protocolData.results || [],
          format: formatData.results || [],
        });
        setHasSuggestions(
          (personaData.results?.length || 0) +
            (protocolData.results?.length || 0) +
            (formatData.results?.length || 0) >
            0,
        );
      } catch (err) {
        console.error("Suggestion fetch failed:", err.message);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 1500);

    return () => clearTimeout(debounce);
  }, [template]);

  // Tour
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setTourUser(user);
    });
  }, []);

  const MODEL_CONFIG = {
    gemini: { label: "Gemini", storageKey: "sandbox_sk_gemini" },
    openai: { label: "GPT-4o Mini", storageKey: "sandbox_sk_openai" },
    anthropic: { label: "Claude Haiku", storageKey: "sandbox_sk_anthropic" },
  };

  const MarkdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-slate-200 font-mono text-sm font-bold mt-3 mb-1">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-slate-200 font-mono text-xs font-bold mt-3 mb-1">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-slate-300 font-mono text-xs font-semibold mt-2 mb-1">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-slate-300 text-xs leading-relaxed mb-2">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="text-slate-100 font-semibold">{children}</strong>
    ),
    ul: ({ children }) => (
      <ul className="text-slate-300 text-xs list-disc list-inside mb-2 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-slate-300 text-xs list-decimal list-inside mb-2 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="text-slate-300">{children}</li>,
    code: ({ inline, children }) =>
      inline ? (
        <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">
          {children}
        </code>
      ) : (
        <code className="block bg-slate-800 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300 overflow-x-auto my-2">
          {children}
        </code>
      ),
    pre: ({ children }) => (
      <pre className="bg-slate-800 border border-slate-700 rounded p-2 overflow-x-auto my-2">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <table className="w-full text-xs border-collapse my-2">{children}</table>
    ),
    th: ({ children }) => (
      <th className="text-slate-200 border border-slate-700 px-2 py-1 text-left font-mono">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="text-slate-300 border border-slate-700 px-2 py-1">
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-indigo-500 pl-3 text-slate-400 italic my-2">
        {children}
      </blockquote>
    ),
  };
  console.log("Render state:", {
    isFetchingSuggestions,
    hasSuggestions,
    suggestions,
  });

  const TYPE_CONFIG = {
    persona: {
      icon: Brain,
      color: "text-violet-400",
      border: "border-violet-500/40",
      bg: "bg-violet-500/10",
      glow: "shadow-violet-500/20",
      dot: "bg-violet-400",
    },
    protocol: {
      icon: GitBranch,
      color: "text-blue-400",
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      glow: "shadow-blue-500/20",
      dot: "bg-blue-400",
    },
    format: {
      icon: LayoutTemplate,
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      glow: "shadow-emerald-500/20",
      dot: "bg-emerald-400",
    },
    template: {
      icon: FileCode2,
      color: "text-amber-400",
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      glow: "shadow-amber-500/20",
      dot: "bg-amber-400",
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <PackLoader
          onLoad={({ persona, protocol, format, template }) => {
            if (persona) setSelectedPersona(persona);
            if (protocol) setSelectedProtocol(protocol);
            if (format) setSelectedFormat(format);
            if (template) {
              setSelectedTemplate(template);
              setTemplate(template.content);
              setVariables({});
            }
          }}
        />
      </Suspense>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 h-[calc(100vh-69px)] overflow-hidden">
        {" "}
        {/* Left Column: Composable Matrix Inputs */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 h-full">
          {/* redesigned */}
          <div className="border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-900/30 p-5 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
                  <Layers size={14} className="text-indigo-400" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide">
                  Architecture Layers
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all"
                  id="tour-new-component"
                >
                  <Plus size={12} />
                  New
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-red-900/20 border border-slate-700/60 hover:border-red-800/60 rounded-lg text-xs text-slate-400 hover:text-red-400 transition-all"
                >
                  <ListRestart size={12} />
                  Reset
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 ml-9">
              Compose your prompt matrix layer by layer.
            </p>

            {showCreateModal && (
              <CreateComponentModal
                onClose={() => setShowCreateModal(false)}
                onCreated={handleComponentCreated}
              />
            )}

            {/* Layer Cards */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2"
              id="tour-architecture-layers"
            >
              {["persona", "protocol", "format", "template"].map((type) => {
                const selected =
                  type === "persona"
                    ? selectedPersona
                    : type === "protocol"
                      ? selectedProtocol
                      : type === "format"
                        ? selectedFormat
                        : selectedTemplate;

                const config = TYPE_CONFIG[type];
                const Icon = config.icon;

                return (
                  <button
                    key={type}
                    onClick={() => setSelectModal(type)}
                    className={`group relative p-3.5 border rounded-xl text-left transition-all duration-200 ${
                      selected
                        ? `${config.bg} ${config.border} shadow-lg ${config.glow}`
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Icon + type label */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                          selected ? config.bg : "bg-slate-800"
                        }`}
                      >
                        <Icon
                          size={13}
                          className={
                            selected
                              ? config.color
                              : "text-slate-500 group-hover:text-slate-400"
                          }
                        />
                      </div>
                      {selected && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}
                        />
                      )}
                    </div>

                    {/* Type label */}
                    <div
                      className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-1 transition-colors ${
                        selected
                          ? config.color
                          : "text-slate-600 group-hover:text-slate-500"
                      }`}
                    >
                      {type}
                    </div>

                    {/* Selected name or placeholder */}
                    <div
                      className={`text-xs font-medium truncate transition-colors ${
                        selected
                          ? "text-slate-200"
                          : "text-slate-600 group-hover:text-slate-500"
                      }`}
                    >
                      {selected ? selected.name : "None"}
                    </div>

                    {/* Hover indicator */}
                    {!selected && (
                      <div className="absolute inset-0 rounded-xl border border-indigo-500/0 group-hover:border-indigo-500/20 transition-all duration-200" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectModal && (
              <SelectComponentModal
                type={selectModal}
                onClose={() => setSelectModal(null)}
                onSelect={(component) => {
                  handleComponentSelected(selectModal, component);
                  setSelectModal(null);
                }}
              />
            )}
          </div>

          {/* Semantic Suggestions */}
          {(isFetchingSuggestions || hasSuggestions) && (
            <div className="border border-slate-800 bg-slate-900/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-indigo-400" />
                <h3 className="text-xs font-mono text-indigo-400 font-semibold">
                  SEMANTIC SUGGESTIONS
                </h3>
                {isFetchingSuggestions && (
                  <Loader2
                    size={11}
                    className="animate-spin text-slate-500 ml-auto"
                  />
                )}
              </div>

              {!isFetchingSuggestions &&
                ["persona", "protocol", "format"].map(
                  (type) =>
                    suggestions[type]?.length > 0 && (
                      <div key={type} className="mb-3">
                        <p className="text-xs font-mono text-slate-500 mb-1.5">
                          {type.toUpperCase()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions[type].map((s) => {
                            const isSelected =
                              type === "persona"
                                ? selectedPersona?.slug === s.slug
                                : type === "protocol"
                                  ? selectedProtocol?.slug === s.slug
                                  : selectedFormat?.slug === s.slug;

                            return (
                              <button
                                key={s.id}
                                onClick={() => handleComponentSelected(type, s)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                                  isSelected
                                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
                                }`}
                              >
                                {isSelected && (
                                  <Check
                                    size={11}
                                    className="text-indigo-400"
                                  />
                                )}
                                {s.name}
                                <span className="text-slate-600 text-xs">
                                  {Math.round(s.similarity * 100)}%
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                )}
            </div>
          )}

          {/* Task Template Area */}
          {/* Task Template Area */}
          <div
            className="flex flex-col border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-900/30 p-5 rounded-2xl shadow-xl"
            id="tour-task-template"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60">
                  <FileText size={13} className="text-slate-400" />
                </div>
                <label className="text-xs font-semibold text-slate-300 tracking-wide">
                  Task Template
                </label>
              </div>
              {template.length > 0 && (
                <span className="text-[11px] font-mono text-slate-600">
                  {template.length} chars
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your task template here. Use double curly braces for variables, e.g., {{code_snippet}}"
              className="w-full h-48 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-slate-950 resize-none transition-all leading-relaxed placeholder:text-slate-700"
            />

            {/* Detected Variables */}
            {detectedVars.length > 0 && (
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Variable size={11} className="text-slate-500" />
                  <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                    Detected Variables
                  </p>
                  <span className="text-[11px] font-mono text-slate-700">
                    {detectedVars.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {detectedVars.map((varName) => (
                    <div key={varName} className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-lg px-2.5 py-1.5 w-36 shrink-0">
                        <Braces
                          size={11}
                          className="text-indigo-500 shrink-0"
                        />
                        <span className="text-xs font-mono text-indigo-400 truncate">
                          {varName}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={`Value for ${varName}…`}
                        value={variables[varName] ?? ""}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            [varName]: e.target.value,
                          }))
                        }
                        className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500/60 transition-all placeholder:text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center">
              {error ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-xs text-red-400 font-mono max-w-[70%]">
                    {error}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                  <p className="text-xs text-slate-600 font-mono">
                    {template.length > 0
                      ? "Ready to compile."
                      : "Start typing to begin."}
                  </p>
                </div>
              )}
              <button
                onClick={handleCompile}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 ml-auto"
                id="tour-compile-button"
              >
                <Zap size={13} />
                Compile Matrix
              </button>
            </div>
          </div>
        </div>
        {/* Right Column: Output + History Tabs */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-xl p-4 flex flex-col h-full overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveRightTab("output")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeRightTab === "output"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="tour-output-tab"
              >
                OUTPUT
              </button>
              <button
                onClick={() => setActiveRightTab("history")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeRightTab === "history"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                HISTORY
                {history.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                    {history.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveRightTab("run")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeRightTab === "run"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="tour-run-tab"
              >
                RUN
              </button>
              <button
                onClick={() => setActiveRightTab("chats")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeRightTab === "chats"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                CHATS
                {chatSessions.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-slate-700 rounded text-xs">
                    {chatSessions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveRightTab("chain")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  activeRightTab === "chain"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="tour-chain-tab"
              >
                CHAIN
              </button>
            </div>

            {/* Copy + Download — only on output tab */}
            {activeRightTab === "output" && compiledOutput && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  {copied ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  <Download size={12} />
                  JSON
                </button>
              </div>
            )}
          </div>

          {/* Output Tab */}
          {activeRightTab === "output" && (
            <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              {compiledOutput ? (
                <>
                  {/* Output meta bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Boxes size={12} className="text-indigo-400" />
                      <span className="text-[11px] font-mono text-slate-400">
                        compiled_blueprint
                      </span>
                      <span className="text-[11px] font-mono text-slate-700">
                        ·
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">
                        {compiledOutput.length} message
                        {compiledOutput.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] font-mono text-green-600">
                        ready
                      </span>
                    </div>
                  </div>

                  {/* JSON output */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                      {JSON.stringify(compiledOutput, null, 2)
                        .split("\n")
                        .map((line, i) => {
                          // Colorize keys, strings, roles
                          const keyMatch = line.match(
                            /^(\s*)("[\w]+")(: )(.*)/,
                          );
                          if (keyMatch) {
                            const [, indent, key, colon, value] = keyMatch;
                            const isRole = key === '"role"';
                            const isSystem = value.includes('"system"');
                            const isUser = value.includes('"user"');
                            const isAssistant = value.includes('"assistant"');
                            return (
                              <span key={i} className="block">
                                {indent}
                                <span
                                  className={
                                    isRole
                                      ? "text-indigo-400"
                                      : "text-blue-400/80"
                                  }
                                >
                                  {key}
                                </span>
                                <span className="text-slate-600">{colon}</span>
                                <span
                                  className={
                                    isSystem
                                      ? "text-violet-400"
                                      : isUser
                                        ? "text-emerald-400"
                                        : isAssistant
                                          ? "text-amber-400"
                                          : "text-slate-300"
                                  }
                                >
                                  {value}
                                </span>
                              </span>
                            );
                          }
                          return (
                            <span key={i} className="block">
                              {line}
                            </span>
                          );
                        })}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800">
                    <PackageOpen size={20} className="text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 font-mono">
                      No output yet
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Select components, write a template, and hit Compile
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeRightTab === "history" && (
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-slate-600 h-full flex items-center justify-center italic text-xs">
                  No history yet. Compile a prompt to start.
                </div>
              ) : (
                history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setCompiledOutput(JSON.parse(entry.prompt));
                      setVariables(entry.formValues);
                      setActiveRightTab("output");
                    }}
                    className="w-full text-left p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-indigo-400 font-medium">
                        {entry.category}
                      </span>
                      <span className="text-xs text-slate-600 font-mono">
                        {entry.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.persona && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                          {entry.persona}
                        </span>
                      )}
                      {entry.protocol && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                          {entry.protocol}
                        </span>
                      )}
                      {entry.format && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                          {entry.format}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Live Sandbox Tab */}
          {activeRightTab === "run" && (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Model Selector */}
              <div className="flex items-center gap-2">
                {Object.entries(MODEL_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedModel(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      selectedModel === key
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
                {/* New Chat Initiator */}
                {conversation.length > 0 && (
                  <button
                    onClick={handleNewChat}
                    className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    <Plus size={12} />
                    New Chat
                  </button>
                )}
              </div>

              {/* API Key Input */}
              <input
                type="password"
                placeholder={`Enter ${MODEL_CONFIG[selectedModel].label} API key`}
                value={apiKeys[selectedModel]}
                onChange={(e) => {
                  const val = e.target.value;
                  setApiKeys((prev) => ({ ...prev, [selectedModel]: val }));
                  sessionStorage.setItem(
                    MODEL_CONFIG[selectedModel].storageKey,
                    val,
                  );
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />

              {/* Run Compiled Prompt Button */}
              {compiledOutput && conversation.length === 0 && (
                <button
                  onClick={() => handleSend(true)}
                  disabled={isStreaming || !apiKeys[selectedModel]?.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {isStreaming ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Play size={13} />
                  )}
                  {isStreaming ? "Running..." : "Run Compiled Prompt"}
                </button>
              )}

              {/* Conversation Thread */}
              <div className="h-100 overflow-y-auto flex flex-col gap-3 bg-slate-950 border border-slate-800 rounded-lg p-3">
                {" "}
                {conversation.length === 0 && !isStreaming && (
                  <div className="text-slate-600 h-full flex items-center justify-center italic text-xs">
                    Compile a prompt then hit Run to start.
                  </div>
                )}
                {conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs font-mono text-slate-600">
                      {msg.role === "user"
                        ? "You"
                        : MODEL_CONFIG[selectedModel].label}
                    </span>
                    <div
                      className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                          : "bg-slate-900 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown components={MarkdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="font-sans">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Streaming indicator */}
                {isStreaming && streamingText && (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xs font-mono text-slate-600">
                      {MODEL_CONFIG[selectedModel].label}
                    </span>
                    <div className="max-w-[90%] bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
                      <ReactMarkdown components={MarkdownComponents}>
                        {streamingText}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                <div ref={conversationEndRef} />
              </div>

              {/* Token Metrics */}
              {metrics && (
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-xs font-mono text-slate-500">
                    Input:{" "}
                    <span className="text-slate-300">
                      {metrics.inputTokens}
                    </span>
                  </span>
                  <span className="text-xs text-slate-700">·</span>
                  <span className="text-xs font-mono text-slate-500">
                    Output:{" "}
                    <span className="text-slate-300">
                      {metrics.outputTokens}
                    </span>
                  </span>
                  <span className="text-xs text-slate-700">·</span>
                  <span className="text-xs font-mono text-slate-500">
                    Total:{" "}
                    <span className="text-indigo-400">
                      {metrics.totalTokens}
                    </span>
                  </span>
                </div>
              )}

              {/* Follow-up Input */}
              {conversation.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask a follow-up..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !isStreaming && handleSend(false)
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSend(false)}
                    disabled={isStreaming || !userInput.trim()}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs transition-colors"
                  >
                    {isStreaming ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat History */}
          {activeRightTab === "chats" && (
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 transition-colors"
              >
                <Plus size={12} />
                New Chat Session
              </button>

              {chatSessions.length === 0 ? (
                <div className="text-slate-600 h-full flex items-center justify-center italic text-xs">
                  No chat sessions yet. Run a compiled prompt to start.
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleResumeChat(session)}
                    className={`w-full text-left p-3 border rounded-lg transition-all cursor-pointer ${
                      activeChatId === session.id
                        ? "bg-indigo-600/10 border-indigo-500/40"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-indigo-400 font-medium truncate max-w-[70%]">
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                        {MODEL_CONFIG[session.model]?.label}
                      </span>
                      {session.persona && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono">
                          {session.persona}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        {session.conversation.length} messages
                      </span>
                      <span className="text-xs text-slate-600 font-mono">
                        {session.updatedAt}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chain Tab */}
          <div
            className={
              activeRightTab === "chain"
                ? "flex flex-col flex-1 overflow-hidden"
                : "hidden"
            }
          >
            <ChainBuilder
              apiKeys={apiKeys}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
        <TourTooltip
          userId={tourUser?.id}
          onComplete={() => console.log("Tour completed")}
        />
      </div>
    </>
  );
}
