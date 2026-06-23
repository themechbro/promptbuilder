// robots.js
export default function robots() {
  const base = "https://promptbuilder-five.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/standard"],
        disallow: [
          "/auth/",
          "/api/",
          "/settings",
          "/manage",
          "/advanced",
          "/community",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
