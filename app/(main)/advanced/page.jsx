import AdvancedStudio from "./advancedClient";

export const metadata = {
  title: "Advanced Studio — Prompt IDE with Vault & Chaining",
  description:
    "Full prompt engineering IDE. Use the component vault, build prompt chains, and execute against multiple AI providers. Requires free account.",
  alternates: {
    canonical: "https://promptbuilder-five.vercel.app/advanced",
  },
  openGraph: {
    title: "Advanced Studio | Prompt Builder",
    description:
      "Component vault, prompt chaining, and multi-provider execution in one IDE.",
    url: "https://promptbuilder-five.vercel.app/advanced",
  },
};

export default function AdvancedPage() {
  return <AdvancedStudio />;
}
