import HomeClient from "./standardClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Standard Studio",
  description:
    "Run prompts against OpenAI, Anthropic, and Gemini models in a free browser-based prompt runner. API keys stay on your device.",
  path: "/standard",
  socialTitle: "Standard Studio | Prompt Builder",
});

export default function StandardPage() {
  return <HomeClient />;
}
