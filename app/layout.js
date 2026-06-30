import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {
  creatorName,
  creatorUrl,
  defaultDescription,
  defaultOgImage,
  defaultTitle,
  siteName,
  siteShortName,
  siteUrl,
} from "./lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  title: {
    default: defaultTitle,
    template: "%s | Prompt Builder",
  },
  description: defaultDescription,
  keywords: [
    "prompt builder",
    "prompt engineering tool",
    "AI prompt IDE",
    "prompt components",
    "prompt chaining",
    "MCP server",
    "Claude Desktop prompts",
    "Cursor prompts",
    "LLM prompt tool",
    "ChatGPT prompt builder",
    "Gemini prompt tool",
    "prompt vault",
    "open source prompt tool",
    "prompt template library",
    "prompt engineering",
    "AI prompt library",
    "Adrin T Paul",
    "themechbro",
  ],
  authors: [{ name: creatorName, url: creatorUrl }],
  creator: creatorName,
  publisher: creatorName,
  category: "developer tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage.url],
    creator: "@themechbro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "JxFIKx0UgDLimx46iUYPsfjXgFmkaplSPF6t31Li8nw",
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [{ url: "/logo/icon.png", type: "image/png" }],
    shortcut: ["/logo/icon.png"],
    apple: [{ url: "/logo/icon.png" }],
  },
  other: {
    "apple-mobile-web-app-title": siteShortName,
  },
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
