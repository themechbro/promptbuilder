import { NextResponse } from "next/server";
import { verifyApiKey } from "@/utils/apiKeyHelper";
import {
  rateLimiters,
  checkRateLimit,
  rateLimitResponse,
} from "@/utils/ratelimit";

export const CATEGORIES = [
  {
    id: "code-review",
    label: "Code Review",
    description: "Code review, quality checks, and refactoring guidance",
  },
  {
    id: "writing",
    label: "Writing",
    description: "Content writing, copywriting, and creative writing",
  },
  {
    id: "analysis",
    label: "Analysis",
    description: "Data analysis, research synthesis, and critical evaluation",
  },
  {
    id: "research",
    label: "Research",
    description:
      "Research frameworks, literature review, and information gathering",
  },
  {
    id: "debugging",
    label: "Debugging",
    description: "Bug diagnosis, error analysis, and troubleshooting",
  },
  {
    id: "documentation",
    label: "Documentation",
    description: "Technical docs, API documentation, and guides",
  },
  {
    id: "planning",
    label: "Planning",
    description: "Project planning, roadmaps, and strategic frameworks",
  },
  {
    id: "data",
    label: "Data",
    description: "Data processing, transformation, and reporting",
  },
  {
    id: "customer-support",
    label: "Customer Support",
    description: "Support workflows, complaint handling, and refund management",
  },
  {
    id: "hr",
    label: "HR",
    description: "Performance reviews, hiring, and talent acquisition",
  },
];

// GET /api/mcp/categories
export async function GET(request) {
  try {
    const auth = await verifyApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key." },
        { status: 401 },
      );
    }

    // Reuse mcpComponentsList limiter — same risk profile, cheap read
    const { success, retryAfter } = await checkRateLimit(
      rateLimiters.mcpComponentsList,
      auth.userId,
    );
    if (!success) return rateLimitResponse(retryAfter);

    return NextResponse.json({
      categories: CATEGORIES,
      count: CATEGORIES.length,
    });
  } catch (err) {
    console.error("MCP categories error:", err.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
