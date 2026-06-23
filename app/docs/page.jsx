import DocsClient from "./DocsClient";

export const metadata = {
  title: "Documentation",
  description:
    "Full documentation for Prompt Builder — getting started, component vault, prompt chaining, MCP server setup, and API keys.",
  alternates: {
    canonical: "https://promptbuilder-five.vercel.app/docs",
  },
  openGraph: {
    title: "Prompt Builder Docs",
    description:
      "Learn how to use the component vault, chain prompts, set up the MCP server for Claude Desktop, and manage API keys.",
    url: "https://promptbuilder-five.vercel.app/docs",
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
