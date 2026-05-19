export const systemTemplates = {
  summarize: {
    id: "summarize",
    shortName: "Summarize",
    label: "Executive Summary Engine",
    description: "Converts lengthy documentation or resumes into clear, metric-driven analysis blocks.",
    fields: [
      {
        id: "content",
        label: "Source Material (Text or PDF Content)",
        type: "textarea",
        placeholder: "Paste text or drop your parsed PDF file here...",
        required: true
      },
      {
        id: "format",
        label: "Summary Style",
        type: "select",
        options: ["Prioritized Bullet Points", "Executive Abstract", "Technical Breakdown"],
        required: true
      },
      {
        id: "audience",
        label: "Who is reading this?",
        type: "select",
        options: ["Non-Technical Stakeholders", "C-Suite Executives", "Engineering Team"],
        required: true
      }
    ],
    prompt_template: `[System Role]
Act as an elite corporate communications strategist specializing in structural information architecture.

[Objective]
Condense the source material provided below. Deliver high-signal information tailored specifically for a {audience} audience.

[Output Structure Constraints]
1. Format your response strictly as a {format}.
2. Bypass all conversational filler. Go straight to the data.
3. Keep sentences concise, punchy, and heavily prioritized by significance.

[Source Material]
{content}

[Strategic Briefing Output]:`
  },

  extractData: { // FIXED: Changed from extract_data to camelCase to match Workspace.jsx state tracking maps
    id: "extractData",
    shortName: "Extract Data",
    label: "Semantic Data Parser",
    description: "Strips conversational fluff and maps unstructured data directly into clean structural schemas.",
    fields: [
      {
        id: "content",
        label: "Source Material",
        type: "textarea",
        placeholder: "Paste raw logs, conversation transcripts, invoices, or strings...",
        required: true
      },
      {
        id: "fields",
        label: "What specific data should we pull out?",
        type: "text",
        placeholder: "e.g., customer email, query optimization times, code vulnerabilities",
        required: true
      },
      {
        id: "output_format",
        label: "Output Format",
        type: "select",
        options: ["JSON Object", "Markdown Data Table", "Clean Schema List"],
        required: true
      }
    ],
    prompt_template: `[System Role]
Act as a deterministic data extraction microservice. You execute raw string parsing without human interpretation or commentary.

[Objective]
Scan the incoming source material and isolate only the following targeted tracking targets: {fields}.

[Execution Parameters]
1. Output format protocol: {output_format}.
2. If a requested data point cannot be found inside the text with absolute mathematical certainty, return null or a blank field. Do not invent context.
3. Zero conversational outputs. Your response must be instantly processable by external parsing software.

[Source Unstructured Material]
{content}

[Parsed Output Stream]:`
  },

  classify: {
    id: "classify",
    shortName: "Classify",
    label: "Strategic Triage Engine",
    description: "Sorts messy operational inputs into precise categories with optional architectural reasoning.",
    fields: [
      {
        id: "content",
        label: "Item to Categorize",
        type: "textarea",
        placeholder: "Paste customer tickets, code bugs, system logs, or text anomalies...",
        required: true
      },
      {
        id: "categories",
        label: "Allowed Categories / Buckets",
        type: "text",
        placeholder: "e.g., Bug/Feature/Question, High/Medium/Low Priority, Positive/Negative",
        required: true
      },
      {
        id: "reasoning",
        label: "Output Rules",
        type: "select",
        options: ["Category Name Only", "Include Analytical Reasoning"],
        required: true
      }
    ],
    prompt_template: `[System Role]
Act as an automated operational triage router. You possess zero margin for categorization error.

[Objective]
Analyze the targeted input text and map it accurately into exactly one of these specified buckets: [{categories}].

[Processing Instruction]
Constraint: {reasoning}

[Target Input Text]
{content}

[Triage Router Assignment]:`
  },

  write: { // Matches your "Draft" component view tracking parameters
    id: "write",
    shortName: "Draft",
    label: "Professional Copy Architect",
    description: "Generates high-conversion text blocks, documentation, or code changes with strict style metrics.",
    fields: [
      {
        id: "content_type",
        label: "What are you writing?",
        type: "select",
        options: ["Technical Product Documentation", "High-Conversion Cold Outreach Email", "LinkedIn Thought Leadership Post", "Engineering Release Changelog Summary"],
        required: true
      },
      {
        id: "topic",
        label: "What is the core topic or goal?",
        type: "text",
        placeholder: "e.g., Shipping a client-side tokenizer engine reducing API dependencies to zero",
        required: true
      },
      {
        id: "tone",
        label: "Tone of Voice",
        type: "select",
        options: ["Technical & Authoritative", "Engaging & Persuasive", "Direct & Brief"],
        required: true
      },
      {
        id: "constraints",
        label: "Extra Rules / Constraints (Optional)",
        type: "text",
        placeholder: "e.g., Keep under 150 words, include 3 specific metric markers, use active voice",
        required: false
      }
    ],
    prompt_template: `[System Role]
Act as an elite technical copywriter and content strategist specializing in industry-specific clarity.

[Objective]
Construct a professional-grade {content_type} focused on: {topic}.

[Style & Formatting Constraints]
1. Stylistic Resonance Profile: {tone}.
2. Additional structural restrictions: {constraints}.
3. Avoid generic buzzwords (e.g., do not use words like 'revolutionize', 'synergy', or 'delve'). 
4. Optimize for extreme readability by leveraging bullet layouts, short paragraphs, and bold focal hooks.

[Draft Composition Output]:`
  },

  analyze: {
    id: "analyze",
    shortName: "Analyze",
    label: "Qualitative Risk & Insight Analyst",
    description: "Scrutinizes source text to isolate hidden vulnerabilities, systemic bottlenecks, or growth targets.",
    fields: [
      {
        id: "content",
        label: "Material to Audit",
        type: "textarea",
        placeholder: "Paste architecture descriptions, operational plans, codebase segments, or proposals...",
        required: true
      },
      {
        id: "focus",
        label: "What should the analysis focus on?",
        type: "select",
        options: ["Security Vulnerabilities & Architecture Bottlenecks", "Commercial Value Disconnects & Friction Points", "Process Optimization & Latency Drag Vectors"],
        required: true
      },
      {
        id: "output_format",
        label: "Report Style",
        type: "select",
        options: ["Prioritized Risk Registry", "SWOT Matrix", "Gap Analysis Report"],
        required: true
      }
    ],
    prompt_template: `[System Role]
Act as a principal system architect and veteran operational risk consultant.

[Objective]
Execute an exhaustive, high-criticality diagnostic audit on the source material provided below. 

[Focus Parameter]
Your assessment must focus heavily on isolating: {focus}.

[Report Layout Blueprint]
Deliver the results formatted as a comprehensive {output_format}. Ensure every observation is backed by a direct contextual fact found in the source text, noting immediate, actionable remediation steps.

[Source Material Under Audit]
{content}

[Diagnostic Assessment Output Report]:`
  }
};

export function getAllTemplates() {
  if (typeof window === "undefined") return systemTemplates;
  
  const savedCustom = localStorage.getItem("prompt_builder_custom_templates");
  if (!savedCustom) return systemTemplates;

  try {
    const parsedCustom = JSON.parse(savedCustom);
    return { ...systemTemplates, ...parsedCustom };
  } catch (e) {
    console.error("Failed to hydrate custom templates from localStorage:", e);
    return systemTemplates;
  }
}