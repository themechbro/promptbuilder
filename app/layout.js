import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PromptBuilder | Stateless Prompt Engineering & Multi-Model Sandbox",
  description: "An enterprise-grade, stateless prompt orchestration IDE designed to build, compile, and validate high-signal LLM frameworks with zero-cost serverless edge proxies.",
  keywords: [
    "Prompt Engineering", 
    "LLM Telemetry", 
    "Next.js Developer Tools", 
    "Gemini 3.1 Flash", 
    "Serverless Proxy IDE"
  ],
  authors: [{ name: "themechbro" }],
  openGraph: {
    title: "PromptBuilder | Stateless Prompt Engineering & Multi-Model Sandbox",
    description: "Stateless prompt compilation workspace showing explicit token optimization metrics across Gemini, OpenAI, and Anthropic runtimes.",
    type: "website",
    url: "https://promptbuilder-five.vercel.app/", 
    images: [
      {
        url: "./icon.png", 
        width: 1200,
        height: 630,
        alt: "PromptBuilder Workspace Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptBuilder | Stateless Prompt Engineering & Multi-Model Sandbox",
    description: "Stateless prompt orchestration IDE tracking real-time API token weights.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
