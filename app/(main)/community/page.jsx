import CommunityClient from "./communityClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Community Vault",
  description:
    "Browse public prompt components, curated prompt packs, and reusable templates shared by the Prompt Builder community.",
  path: "/community",
  socialTitle: "Community Vault | Prompt Builder",
});

export default function CommunityPage() {
  return <CommunityClient />;
}
