// src/app/robots.js

export default function robots() {
  const base = "https://promptbuilder-five.vercel.app/"; // update to your domain

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/standard", "/advanced", "/community"],
        // Keep auth, API, and private routes out of index
        disallow: ["/auth/", "/api/", "/settings", "/manage"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
