import DocsClient from "./DocsClient";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Documentation",
  description:
    "Full Prompt Builder documentation covering setup, the component vault, prompt chaining, MCP server configuration, and API keys.",
  path: "/docs",
  socialTitle: "Prompt Builder Docs",
});

export default function DocsPage() {
  return <DocsClient />;
}
