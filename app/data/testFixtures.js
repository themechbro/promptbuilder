export const testFixtures = [
  {
    name: "Scenario A: Developer Resume Extraction",
    workflow: "extractData", // Updated to match your actual state keys exactly
    formInputs: {
      content: "Seeking Full Stack Developer. Must have 3+ years experience with Node.js, Next.js, Redis token-bucket rate limiting, and HLS video streaming metrics.",
      target: "Core framework requirements and architectural niche skills",
      format: "Markdown Data Table"
    }
  },
  {
    name: "Scenario B: Rail Documentation Structural Summary",
    workflow: "summarize",
    formInputs: {
      content: "The newly introduced Vande Bharat train sets utilize decentralized distributed traction power architecture. Acceleration steps achieve 0-100 km/h in 52 seconds, running on 25kV AC overhead catenary systems backed by regenerative breaking modules returning 30% electrical feedback.",
      style: "Technical Bulletins Summary",
      audience: "Rail Logistics Operations Team"
    }
  },
  {
    name: "Scenario C: Technical PR Code Review Classification",
    workflow: "classify",
    formInputs: {
      content: "PR #12700 for gRPC-Java-docs fixes a race condition where protocol execution errors drop incoming trailer headers under high concurrency limits.",
      categories: "Security Patch, Documentation Fix, High Priority Bugfix",
      system: "GitHub Webhook Router"
    }
  },
  {
    name: "Scenario D: System Architecture Vulnerability Audit",
    workflow: "analyze",
    formInputs: {
      content: "A Time-of-Check to Time-of-Use (TOCTOU) race condition exists in the stream processing authentication layer. File metadata validation occurs outside the atomic context lock, enabling potential file system descriptor swaps during high concurrent loads.",
      focus: "Race conditions and atomicity sequence blocks",
      style: "Security Advisory Format"
    }
  }
];