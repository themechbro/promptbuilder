// export const systemTemplates = {
//   summarize: {
//     id: "summarize",
//     shortName: "Summarize",
//     label: "Executive Summary Engine",
//     description:
//       "Converts lengthy documentation or resumes into clear, metric-driven analysis blocks.",
//     fields: [
//       {
//         id: "content",
//         label: "Source Material (Text or PDF Content)",
//         type: "textarea",
//         placeholder: "Paste text or drop your parsed PDF file here...",
//         required: true,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Context (Optional)",
//         type: "textarea",
//         placeholder: "Inject output from a previous step here...",
//         required: false,
//       },
//       {
//         id: "format",
//         label: "Summary Style",
//         type: "select",
//         options: [
//           "Prioritized Bullet Points",
//           "Executive Abstract",
//           "Technical Breakdown",
//         ],
//         required: true,
//       },
//       {
//         id: "audience",
//         label: "Who is reading this?",
//         type: "select",
//         options: [
//           "Non-Technical Stakeholders",
//           "C-Suite Executives",
//           "Engineering Team",
//         ],
//         required: true,
//       },
//     ],
//     prompt_template: `[System Role]
// Act as an elite corporate communications strategist specializing in structural information architecture.

// [Objective]
// Condense the source material provided below. Deliver high-signal information tailored specifically for a {audience} audience.

// [Output Structure Constraints]
// 1. Format your response strictly as a {format}.
// 2. Bypass all conversational filler. Go straight to the data.
// 3. Keep sentences concise, punchy, and heavily prioritized by significance.

// [Source Material]
// {content}

// [Upstream Context]
// {chain_context}

// [Strategic Briefing Output]:`,
//   },

//   extractData: {
//     // FIXED: Changed from extract_data to camelCase to match Workspace.jsx state tracking maps
//     id: "extractData",
//     shortName: "Extract Data",
//     label: "Semantic Data Parser",
//     description:
//       "Strips conversational fluff and maps unstructured data directly into clean structural schemas.",
//     fields: [
//       {
//         id: "content",
//         label: "Source Material",
//         type: "textarea",
//         placeholder:
//           "Paste raw logs, conversation transcripts, invoices, or strings...",
//         required: true,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Context (Optional)",
//         type: "textarea",
//         placeholder: "Inject output from a previous step here...",
//         required: false,
//       },
//       {
//         id: "fields",
//         label: "What specific data should we pull out?",
//         type: "text",
//         placeholder:
//           "e.g., customer email, query optimization times, code vulnerabilities",
//         required: true,
//       },
//       {
//         id: "output_format",
//         label: "Output Format",
//         type: "select",
//         options: ["JSON Object", "Markdown Data Table", "Clean Schema List"],
//         required: true,
//       },
//     ],
//     prompt_template: `[System Role]
// Act as a deterministic data extraction microservice. You execute raw string parsing without human interpretation or commentary.

// [Objective]
// Scan the incoming source material and isolate only the following targeted tracking targets: {fields}.

// [Execution Parameters]
// 1. Output format protocol: {output_format}.
// 2. If a requested data point cannot be found inside the text with absolute mathematical certainty, return null or a blank field. Do not invent context.
// 3. Zero conversational outputs. Your response must be instantly processable by external parsing software.

// [Source Unstructured Material]
// {content}

// [Upstream Context]
// {chain_context}

// [Parsed Output Stream]:`,
//   },

//   classify: {
//     id: "classify",
//     shortName: "Classify",
//     label: "Strategic Triage Engine",
//     description:
//       "Sorts messy operational inputs into precise categories with optional architectural reasoning.",
//     fields: [
//       {
//         id: "content",
//         label: "Item to Categorize",
//         type: "textarea",
//         placeholder:
//           "Paste customer tickets, code bugs, system logs, or text anomalies...",
//         required: true,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Context (Optional)",
//         type: "textarea",
//         placeholder: "Inject output from a previous step here...",
//         required: false,
//       },
//       {
//         id: "categories",
//         label: "Allowed Categories / Buckets",
//         type: "text",
//         placeholder:
//           "e.g., Bug/Feature/Question, High/Medium/Low Priority, Positive/Negative",
//         required: true,
//       },
//       {
//         id: "reasoning",
//         label: "Output Rules",
//         type: "select",
//         options: ["Category Name Only", "Include Analytical Reasoning"],
//         required: true,
//       },
//     ],
//     prompt_template: `[System Role]
// Act as an automated operational triage router. You possess zero margin for categorization error.

// [Objective]
// Analyze the targeted input text and map it accurately into exactly one of these specified buckets: [{categories}].

// [Processing Instruction]
// Constraint: {reasoning}

// [Target Input Text]
// {content}

// [Upstream Context]
// {chain_context}

// [Triage Router Assignment]:`,
//   },

//   write: {
//     // Matches your "Draft" component view tracking parameters
//     id: "write",
//     shortName: "Draft",
//     label: "Professional Copy Architect",
//     description:
//       "Generates high-conversion text blocks, documentation, or code changes with strict style metrics.",
//     fields: [
//       {
//         id: "content_type",
//         label: "What are you writing?",
//         type: "select",
//         options: [
//           "Technical Product Documentation",
//           "High-Conversion Cold Outreach Email",
//           "LinkedIn Thought Leadership Post",
//           "Engineering Release Changelog Summary",
//         ],
//         required: true,
//       },
//       {
//         id: "topic",
//         label: "What is the core topic or goal?",
//         type: "text",
//         placeholder:
//           "e.g., Shipping a client-side tokenizer engine reducing API dependencies to zero",
//         required: true,
//       },
//       {
//         id: "tone",
//         label: "Tone of Voice",
//         type: "select",
//         options: [
//           "Technical & Authoritative",
//           "Engaging & Persuasive",
//           "Direct & Brief",
//         ],
//         required: true,
//       },
//       {
//         id: "constraints",
//         label: "Extra Rules / Constraints (Optional)",
//         type: "text",
//         placeholder:
//           "e.g., Keep under 150 words, include 3 specific metric markers, use active voice",
//         required: false,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Context (Optional)",
//         type: "textarea",
//         placeholder: "Inject output from a previous step here...",
//         required: false,
//       },
//     ],
//     prompt_template: `[System Role]
// Act as an elite technical copywriter and content strategist specializing in industry-specific clarity.

// [Objective]
// Construct a professional-grade {content_type} focused on: {topic}.

// [Style & Formatting Constraints]
// 1. Stylistic Resonance Profile: {tone}.
// 2. Additional structural restrictions: {constraints}.
// 3. Avoid generic buzzwords (e.g., do not use words like 'revolutionize', 'synergy', or 'delve').
// 4. Optimize for extreme readability by leveraging bullet layouts, short paragraphs, and bold focal hooks.

// [Upstream Context]
// {chain_context}

// [Draft Composition Output]:`,
//   },

//   analyze: {
//     id: "analyze",
//     shortName: "Analyze",
//     label: "Qualitative Risk & Insight Analyst",
//     description:
//       "Scrutinizes source text to isolate hidden vulnerabilities, systemic bottlenecks, or growth targets.",
//     fields: [
//       {
//         id: "content",
//         label: "Material to Audit",
//         type: "textarea",
//         placeholder:
//           "Paste architecture descriptions, operational plans, codebase segments, or proposals...",
//         required: true,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Context (Optional)",
//         type: "textarea",
//         placeholder: "Inject output from a previous step here...",
//         required: false,
//       },
//       {
//         id: "focus",
//         label: "What should the analysis focus on?",
//         type: "select",
//         options: [
//           "Security Vulnerabilities & Architecture Bottlenecks",
//           "Commercial Value Disconnects & Friction Points",
//           "Process Optimization & Latency Drag Vectors",
//         ],
//         required: true,
//       },
//       {
//         id: "output_format",
//         label: "Report Style",
//         type: "select",
//         options: [
//           "Prioritized Risk Registry",
//           "SWOT Matrix",
//           "Gap Analysis Report",
//         ],
//         required: true,
//       },
//     ],
//     prompt_template: `[System Role]
// Act as a principal system architect and veteran operational risk consultant.

// [Objective]
// Execute an exhaustive, high-criticality diagnostic audit on the source material provided below.

// [Focus Parameter]
// Your assessment must focus heavily on isolating: {focus}.

// [Report Layout Blueprint]
// Deliver the results formatted as a comprehensive {output_format}. Ensure every observation is backed by a direct contextual fact found in the source text, noting immediate, actionable remediation steps.

// [Source Material Under Audit]
// {content}

// [Upstream Context]
// {chain_context}

// [Diagnostic Assessment Output Report]:`,
//   },

//   resumeTailoring: {
//     id: "resumeTailoring",
//     shortName: "Resume Match",
//     label: "Role-Specific Resume Tailoring",
//     description:
//       "Transform a base resume using extracted job description keywords and gap analysis metrics.",
//     prompt_template:
//       "Act as an expert technical resume strategist. I am optimizing my resume for a specific target role.\n\n[TARGET JOB DESCRIPTION KEYWORDS]\n{jd_keywords}\n\n[GAP ANALYSIS DISCREPANCIES]\n{chain_context}\n\n[BASE RESUME CONTENT]\n{base_resume}\n\n[STRATEGY STRUCTURING INSTRUCTIONS]\n{tailor_strategy}\n\nCompile a high-fidelity Markdown resume. Rewrite bullet points using the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]). Prioritize engineering differentiators, distributed systems architecture, or core technical implementations matching the gap anomalies.",
//     fields: [
//       {
//         id: "jd_keywords",
//         label: "Target Job Keywords & Requirements",
//         type: "textarea",
//         placeholder:
//           "Paste the extracted keywords, skills, or specific role requirements here...",
//         required: true,
//       },
//       {
//         id: "chain_context",
//         label: "Upstream Gap Analysis Metrics",
//         type: "textarea",
//         placeholder:
//           "This field will ingest your previous 'Analyze' output automatically...",
//         required: true,
//       },
//       {
//         id: "base_resume",
//         label: "Your Raw/Base Resume",
//         type: "textarea",
//         placeholder:
//           "Paste your existing resume markdown or plain text here...",
//         required: true,
//       },
//       {
//         id: "tailor_strategy",
//         label: "Tailoring Strategy Objective",
//         type: "select",
//         options: [
//           "Maximize ATS Score Alignment",
//           "Emphasize Distributed Systems & Technical Architecture",
//           "Highlight Open-Source Core Contributions",
//           "Focus on System Performance & Infrastructure Scaling",
//         ],
//         required: true,
//       },
//     ],
//   },
// };

// export function getAllTemplates() {
//   if (typeof window === "undefined") return systemTemplates;

//   const savedCustom = localStorage.getItem("prompt_builder_custom_templates");
//   if (!savedCustom) return systemTemplates;

//   try {
//     const parsedCustom = JSON.parse(savedCustom);
//     return { ...systemTemplates, ...parsedCustom };
//   } catch (e) {
//     console.error("Failed to hydrate custom templates from localStorage:", e);
//     return systemTemplates;
//   }
// }

export const systemTemplates = {
  summarize: {
    id: "summarize",
    shortName: "Summarize",
    label: "Executive Summary Engine",
    description:
      "Converts lengthy documentation or job descriptions into clear, metric-driven analysis blocks.",
    fields: [
      {
        id: "content",
        label: "Source Material (Text or PDF Content)",
        type: "textarea",
        placeholder: "Paste text or drop your parsed PDF file here...",
        required: true,
      },
      {
        id: "chain_context",
        label: "Upstream Context (Optional)",
        type: "textarea",
        placeholder: "Inject output from a previous step here...",
        required: false,
      },
      {
        id: "format",
        label: "Summary Style",
        type: "select",
        options: [
          "Prioritized Bullet Points",
          "Executive Abstract",
          "Technical Breakdown",
          "ATS Keyword Extraction List",
        ],
        required: true,
      },
      {
        id: "audience",
        label: "Who is reading this?",
        type: "select",
        options: [
          "Non-Technical Stakeholders",
          "C-Suite Executives",
          "Engineering Team",
          "Technical Recruiters / ATS Parsers",
        ],
        required: true,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as an elite corporate communications strategist specializing in structural information architecture.

[OBJECTIVE]
Condense the source material provided below. Deliver high-signal information tailored specifically for a {audience} audience.

[EXECUTION CONSTRAINTS]
1. Format your response strictly as a {format}.
2. ZERO conversational filler. No introductory or concluding remarks. Go straight to the data.
3. Keep sentences concise, punchy, and heavily prioritized by technical or business significance.
4. If extracting ATS keywords, group them strictly by Hard Skills, Frameworks, and Core Competencies.

[SOURCE MATERIAL]
{content}

[UPSTREAM CONTEXT]
{chain_context}

[OUTPUT]:`,
  },

  extractData: {
    id: "extractData",
    shortName: "Extract Data",
    label: "Semantic Data Parser",
    description:
      "Strips conversational fluff and maps unstructured data directly into clean structural schemas.",
    fields: [
      {
        id: "content",
        label: "Source Material",
        type: "textarea",
        placeholder:
          "Paste raw logs, conversation transcripts, invoices, or strings...",
        required: true,
      },
      {
        id: "chain_context",
        label: "Upstream Context (Optional)",
        type: "textarea",
        placeholder: "Inject output from a previous step here...",
        required: false,
      },
      {
        id: "fields",
        label: "What specific data should we pull out?",
        type: "text",
        placeholder:
          "e.g., framework requirements, years of experience, distributed systems mentions",
        required: true,
      },
      {
        id: "output_format",
        label: "Output Format",
        type: "select",
        options: [
          "Strict JSON Object",
          "Markdown Data Table",
          "Clean Schema List",
        ],
        required: true,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as a deterministic data extraction microservice. You execute raw string parsing without human interpretation, hallucination, or commentary.

[OBJECTIVE]
Scan the incoming source material and isolate ONLY the following targeted parameters: {fields}.

[EXECUTION PARAMETERS]
1. Output format protocol strictly enforced: {output_format}.
2. If a requested data point cannot be found inside the text with absolute mathematical certainty, return 'null' or a blank field. Do NOT invent or infer context.
3. ZERO conversational outputs. Your response must be instantly processable by external parsing software. No markdown code block wrappers (\`\`\`) unless specifically requested.

[SOURCE UNSTRUCTURED MATERIAL]
{content}

[UPSTREAM CONTEXT]
{chain_context}

[PARSED OUTPUT STREAM]:`,
  },

  classify: {
    id: "classify",
    shortName: "Classify",
    label: "Strategic Triage Engine",
    description:
      "Sorts messy operational inputs into precise categories with optional architectural reasoning.",
    fields: [
      {
        id: "content",
        label: "Item to Categorize",
        type: "textarea",
        placeholder:
          "Paste customer tickets, code bugs, system logs, or text anomalies...",
        required: true,
      },
      {
        id: "chain_context",
        label: "Upstream Context (Optional)",
        type: "textarea",
        placeholder: "Inject output from a previous step here...",
        required: false,
      },
      {
        id: "categories",
        label: "Allowed Categories / Buckets",
        type: "text",
        placeholder:
          "e.g., Bug/Feature/Question, High/Medium/Low Priority, Positive/Negative",
        required: true,
      },
      {
        id: "reasoning",
        label: "Output Rules",
        type: "select",
        options: ["Category Name Only", "Include Analytical Reasoning"],
        required: true,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as an automated operational triage router. You possess zero margin for categorization error.

[OBJECTIVE]
Analyze the targeted input text and map it accurately into exactly ONE of these specified buckets: [{categories}].

[PROCESSING INSTRUCTION]
Constraint: {reasoning}

[TARGET INPUT TEXT]
{content}

[UPSTREAM CONTEXT]
{chain_context}

[TRIAGE ROUTER ASSIGNMENT]:`,
  },

  write: {
    id: "write",
    shortName: "Draft",
    label: "Professional Copy Architect",
    description:
      "Generates high-conversion text blocks, documentation, or code changes with strict style metrics.",
    fields: [
      {
        id: "content_type",
        label: "What are you writing?",
        type: "select",
        options: [
          "Technical Product Documentation",
          "High-Conversion Cold Outreach Email",
          "LinkedIn Thought Leadership Post",
          "Engineering Release Changelog Summary",
          "Cover Letter (Technical)",
        ],
        required: true,
      },
      {
        id: "topic",
        label: "What is the core topic or goal?",
        type: "text",
        placeholder: "e.g., Shipping a Redis Lua token-bucket rate limiter",
        required: true,
      },
      {
        id: "tone",
        label: "Tone of Voice",
        type: "select",
        options: [
          "Technical & Authoritative",
          "Engaging & Persuasive",
          "Direct & Brief",
          "Data-Driven & Analytical",
        ],
        required: true,
      },
      {
        id: "constraints",
        label: "Extra Rules / Constraints (Optional)",
        type: "text",
        placeholder:
          "e.g., Keep under 150 words, include 3 specific metric markers",
        required: false,
      },
      {
        id: "chain_context",
        label: "Upstream Context (Optional)",
        type: "textarea",
        placeholder: "Inject output from a previous step here...",
        required: false,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as an elite technical copywriter and content strategist specializing in industry-specific clarity.

[OBJECTIVE]
Construct a professional-grade {content_type} focused on: {topic}.

[STYLE & FORMATTING CONSTRAINTS]
1. Stylistic Resonance Profile: {tone}.
2. Additional structural restrictions: {constraints}.
3. NEGATIVE CONSTRAINTS: Do NOT use generic AI buzzwords (e.g., 'revolutionize', 'synergy', 'delve', 'testament', 'tapestry', 'realm'). 
4. Optimize for extreme readability by leveraging bullet layouts, short paragraphs, and bold focal hooks where applicable.

[UPSTREAM CONTEXT]
{chain_context}

[DRAFT COMPOSITION OUTPUT]:`,
  },

  analyze: {
    id: "analyze",
    shortName: "Analyze",
    label: "Qualitative Risk & Insight Analyst",
    description:
      "Scrutinizes source text to isolate hidden vulnerabilities, systemic bottlenecks, or resume gaps.",
    fields: [
      {
        id: "content",
        label: "Material to Audit",
        type: "textarea",
        placeholder:
          "Paste architecture descriptions, operational plans, or your base resume...",
        required: true,
      },
      {
        id: "chain_context",
        label: "Upstream Context (Optional)",
        type: "textarea",
        placeholder:
          "Inject output from a previous step here (e.g., Job Description keywords)...",
        required: false,
      },
      {
        id: "focus",
        label: "What should the analysis focus on?",
        type: "select",
        options: [
          "Resume vs. Job Description Gap Analysis (ATS Match)",
          "Security Vulnerabilities & Architecture Bottlenecks",
          "Commercial Value Disconnects & Friction Points",
          "Process Optimization & Latency Drag Vectors",
        ],
        required: true,
      },
      {
        id: "output_format",
        label: "Report Style",
        type: "select",
        options: [
          "Actionable Gap Matrix",
          "Prioritized Risk Registry",
          "SWOT Matrix",
        ],
        required: true,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as a principal system architect and veteran operational diagnostic consultant.

[OBJECTIVE]
Execute an exhaustive, high-criticality diagnostic audit on the source material provided below. 

[FOCUS PARAMETER]
Your assessment must focus heavily on isolating: {focus}. 
*If doing a Resume vs. JD Gap Analysis: Compare the 'Material to Audit' (Resume) against the 'Upstream Context' (Job Description). Identify missing hard skills, weak metrics, and unaligned technical scope.*

[REPORT LAYOUT BLUEPRINT]
Deliver the results formatted strictly as a comprehensive {output_format}. Ensure every observation is backed by a direct contextual fact found in the text, noting immediate, actionable remediation steps.

[SOURCE MATERIAL UNDER AUDIT]
{content}

[UPSTREAM CONTEXT]
{chain_context}

[DIAGNOSTIC ASSESSMENT OUTPUT REPORT]:`,
  },

  resumeTailoring: {
    id: "resumeTailoring",
    shortName: "Resume Match",
    label: "Role-Specific Resume Tailoring",
    description:
      "Transform a base resume using extracted job description keywords and gap analysis metrics.",
    fields: [
      {
        id: "target_role",
        label: "Target Job Title",
        type: "text",
        placeholder: "e.g., Senior Backend Engineer, Full Stack Developer",
        required: true,
      },
      {
        id: "jd_keywords",
        label: "Target Job Keywords & Requirements",
        type: "textarea",
        placeholder:
          "Paste the exact job description or extracted keyword list here...",
        required: true,
      },
      {
        id: "chain_context",
        label: "Upstream Gap Analysis Metrics (Optional)",
        type: "textarea",
        placeholder: "Inject your previous 'Analyze' gap matrix output here...",
        required: false,
      },
      {
        id: "content",
        label: "Your Raw/Base Resume",
        type: "textarea",
        placeholder:
          "Paste your existing resume markdown or plain text here...",
        required: true,
      },
      {
        id: "tailor_strategy",
        label: "Tailoring Strategy Objective",
        type: "select",
        options: [
          "Maximize ATS Keyword Density (Unobtrusive)",
          "Emphasize Distributed Systems & Technical Architecture",
          "Highlight Scale, Concurrency, and Performance Metrics",
          "Focus on Product Leadership and Cross-Functional Impact",
        ],
        required: true,
      },
    ],
    prompt_template: `[SYSTEM ROLE]
Act as a Staff-Level Engineering Manager and elite Technical Recruiter at a top-tier tech company. Your singular goal is to rewrite the provided resume to perfectly align with the target job description while passing strict ATS (Applicant Tracking System) parsers.

[OBJECTIVE]
Rewrite the [BASE RESUME CONTENT] for the role of {target_role}, heavily integrating the [TARGET JOB DESCRIPTION KEYWORDS] and addressing any flaws identified in the [GAP ANALYSIS DISCREPANCIES].

[STRICT ENGINEERING CONSTRAINTS]
1. METRICS FIRST: Rewrite every bullet point using the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]). If metrics are missing, structure the sentence so the candidate can easily plug a number in later (e.g., "resulting in a [XX]% reduction in latency").
2. NEGATIVE CONSTRAINTS: DO NOT use generic, weak verbs (e.g., 'helped', 'worked on', 'responsible for'). DO NOT use subjective fluff (e.g., 'passionate', 'results-driven', 'detail-oriented'). Use strong technical verbs (Architected, Engineered, Spearheaded, Orchestrated).
3. KEYWORD INTEGRATION: Organically weave the required technical keywords into the experience bullets. Do not awkwardly stuff them in a way that reads unnaturally to a human engineer.
4. STRATEGY FOCUS: Heavily skew the framing of the technical achievements toward: {tailor_strategy}.

[TARGET JOB DESCRIPTION KEYWORDS]
{jd_keywords}

[GAP ANALYSIS DISCREPANCIES]
{chain_context}

[BASE RESUME CONTENT]
{base_resume}

[RECONSTRUCTED RESUME OUTPUT]
Return the rewritten resume strictly in clean Markdown format. Include a professional summary, skills matrix, and the optimized experience bullets:`,
  },
};

import localforage from "localforage";

export async function getAllTemplates() {
  if (typeof window === "undefined") return systemTemplates;

  try {
    const savedCustom = await localforage.getItem("prompt_builder_custom_templates");
    if (!savedCustom) return systemTemplates;

    const parsedCustom = typeof savedCustom === "string" ? JSON.parse(savedCustom) : savedCustom;
    return { ...systemTemplates, ...parsedCustom };
  } catch (e) {
    console.error("Failed to hydrate custom templates from localforage:", e);
    return systemTemplates;
  }
}
