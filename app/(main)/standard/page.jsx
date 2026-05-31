import HomeClient from "./standardClient";

export const metadata = {
  title: "Standard Studio — Free Prompt Runner",
  description:
    "Run prompts against OpenAI, Anthropic, and Gemini models. No account needed. API keys stay in your browser.",
  alternates: {
    canonical: "https://promptbuilder-five.vercel.app/standard",
  },
  openGraph: {
    title: "Standard Studio | Prompt Builder",
    description:
      "Free, no-login prompt runner for OpenAI, Anthropic, and Gemini.",
    url: "https://promptbuilder-five.vercel.app/standard",
  },
};

export default function StandardPage() {
  return <HomeClient />;
}
