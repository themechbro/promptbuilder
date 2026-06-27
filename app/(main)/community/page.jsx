import CommunityClient from "./communityClient";

export const metadata = {
  title: "Community Vault — Browse Public Prompt Components",
  description:
    "Browse and use community-contributed prompt components, packs, and templates across HR, customer support, image generation, and more.",
  alternates: {
    canonical: "https://promptbuilder-five.vercel.app/community",
  },
  openGraph: {
    title: "Community Vault | Prompt Builder",
    description: "Public library of prompt components, packs, and templates.",
    url: "https://promptbuilder-five.vercel.app/community",
    siteName: "Prompt Builder",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prompt Builder — Component-Based Prompt IDE",
      },
    ],
  },
};

export default function CommunityPage() {
  return <CommunityClient />;
}
