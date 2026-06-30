import SettingsClient from "./SettingsClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "API Keys",
  description:
    "Manage your Prompt Builder API keys and generate MCP client configuration for Claude Desktop, Cursor, and Windsurf.",
  path: "/settings",
  socialTitle: "API Keys | Prompt Builder",
  noIndex: true,
});

export default function SettingsPage() {
  return <SettingsClient />;
}
