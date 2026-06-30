const FALLBACK_SITE_URL = "https://promptbuilder-five.vercel.app";

function normalizeSiteUrl(value) {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const siteName = "Prompt Builder";
export const siteShortName = "PromptBuilder";
export const creatorName = "Adrin T Paul";
export const creatorAlias = "themechbro";
export const creatorUrl = "https://adrin-t-paul.vercel.app/";
export const creatorGithub = "https://github.com/themechbro";
export const creatorLinkedIn = "https://www.linkedin.com/in/adrintpaul/";
export const repositoryUrl = "https://github.com/themechbro/promptbuilder";
export const defaultTitle = "Prompt Builder | AI Prompt IDE by Adrin T Paul";
export const defaultDescription =
  "Prompt Builder is a free, open-source prompt engineering IDE. Build reusable prompt components, chain workflows, explore community packs, and connect to Claude Desktop via MCP.";

export const siteUrl =
  normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.VERCEL_URL,
  ) || FALLBACK_SITE_URL;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}

export const defaultOgImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Prompt Builder preview",
};

function buildRobots(noIndex) {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
  keywords,
  noIndex = false,
  socialTitle,
  canonical = true,
} = {}) {
  const resolvedSocialTitle =
    socialTitle || (typeof title === "string" ? `${title} | ${siteName}` : siteName);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    ...(canonical ? { alternates: { canonical: absoluteUrl(path) } } : {}),
    openGraph: {
      title: resolvedSocialTitle,
      description,
      url: absoluteUrl(path),
      siteName,
      locale: "en_US",
      type: "website",
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedSocialTitle,
      description,
      images: [defaultOgImage.url],
    },
    robots: buildRobots(noIndex),
  };
}
