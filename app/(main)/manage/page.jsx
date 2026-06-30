import ManageClient from "./ManageClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "My Vault",
  description:
    "Manage your saved Prompt Builder components, update metadata, and remove items from your personal vault.",
  path: "/manage",
  socialTitle: "My Vault | Prompt Builder",
  noIndex: true,
});

export default function ManagePage() {
  return <ManageClient />;
}
