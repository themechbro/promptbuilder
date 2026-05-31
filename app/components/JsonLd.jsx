// app/components/JsonLd.jsx
// Drop this into app/page.jsx (landing page) inside the root div

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Software application schema — tells Google this is a tool
        "@type": "SoftwareApplication",
        name: "Prompt Builder",
        url: "https://promptbuilder-five.vercel.app/",
        description:
          "A component-based prompt IDE with a public vault, semantic search, prompt chaining, and an MCP server for Claude Desktop and Cursor.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: "themechbro",
          url: "https://adrin-t-paul.vercel.app",
        },
        codeRepository: "https://github.com/themechbro/promptbuilder",
        license: "https://opensource.org/licenses/MIT",
        keywords: [
          "prompt engineering",
          "prompt builder",
          "AI tools",
          "MCP server",
          "Claude Desktop",
          "prompt chaining",
          "LLM tools",
        ],
      },
      {
        // Website schema — tells Google the site structure
        "@type": "WebSite",
        name: "Prompt Builder",
        url: "https://promptbuilder-five.vercel.app/",
        description: "Free, open-source prompt engineering IDE.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://promptbuilder-five.vercel.app/docs",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
