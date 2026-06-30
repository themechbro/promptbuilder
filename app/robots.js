import { absoluteUrl } from "./lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/api/", "/settings", "/manage"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
