import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://promptbuilder-five.vercel.app/";

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:
      "Prompt Builder — Component-Based Prompt IDE for Claude, GPT & Gemini",
    template: "%s | Prompt Builder",
  },

  description:
    "Prompt Builder is a free, open-source prompt engineering tool. Build reusable prompt components, chain prompts, use the public vault, and connect to Claude Desktop via MCP.",

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
  ],

  authors: [{ name: "themechbro", url: "https://adrin-t-paul.vercel.app" }],

  creator: "themechbro",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Prompt Builder",
    title: "Prompt Builder — Component-Based Prompt IDE",
    description:
      "Build reusable prompt components, chain prompts, and connect to Claude Desktop via MCP. Free and open source.",
    images: [
      {
        url: "/og-image.png", // create a 1200x630 OG image
        width: 1200,
        height: 630,
        alt: "Prompt Builder — Component-Based Prompt IDE",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Prompt Builder — Component-Based Prompt IDE",
    description:
      "Build reusable prompt components, chain prompts, and connect to Claude Desktop via MCP.",
    images: ["/og-image.png"],
    creator: "@themechbro", // update if you have a twitter handle
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
    canonical: BASE_URL,
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
        {children}
      </body>
    </html>
  );
}
