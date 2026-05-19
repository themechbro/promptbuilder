// src/app/robots.js

export default function robots() {
  const baseUrl = "https://promptbuilder-five.vercel.app/";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}