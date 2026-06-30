import AdvancedStudio from "./advancedClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Advanced Studio",
  description:
    "Use the full Prompt Builder IDE with a component vault, prompt chains, semantic search, and multi-provider execution.",
  path: "/advanced",
  socialTitle: "Advanced Studio | Prompt Builder",
});

export default function AdvancedPage() {
  return <AdvancedStudio />;
}
