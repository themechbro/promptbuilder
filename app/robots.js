// robots.js
export default function robots() {
  const base = "https://promptbuilder-five.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/standard", "/advanced", "/community"],
        disallow: ["/auth/", "/api/", "/settings", "/manage"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
