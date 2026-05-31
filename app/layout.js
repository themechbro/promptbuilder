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

export const metadata = {
  title: "Prompt Builder — Build Prompts That Actually Work",
  description:
    "A component-based prompt IDE with a public vault, semantic search, prompt chaining, and an MCP server for Claude Desktop and Cursor.",
  keywords: [
    "Prompt Engineering",
    "Prompt Builder",
    "MCP Server",
    "Claude Desktop",
    "LLM Tools",
    "Next.js Developer Tools",
  ],
  authors: [{ name: "themechbro" }],
  openGraph: {
    title: "Prompt Builder — Build Prompts That Actually Work",
    description:
      "A component-based prompt IDE with a public vault, semantic search, prompt chaining, and an MCP server for Claude Desktop and Cursor.",
    type: "website",
    url: "https://promptbuilder-five.vercel.app/",
    images: [
      {
        url: "./icon.png",
        width: 1200,
        height: 630,
        alt: "Prompt Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Builder — Build Prompts That Actually Work",
    description:
      "Component-based prompt IDE with MCP server integration for Claude Desktop and Cursor.",
  },
  verification: {
    google: "JxFIKx0UgDLimx46iUYPsfjXgFmkaplSPF6t31Li8nw",
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
