// sitemap.js
export default function sitemap() {
  const base = "https://promptbuilder-five.vercel.app";

  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" },
    { url: "/docs", priority: 0.9, changeFrequency: "weekly" },
    { url: "/standard", priority: 0.8, changeFrequency: "monthly" },
    { url: "/advanced", priority: 0.8, changeFrequency: "monthly" },
    { url: "/community", priority: 0.7, changeFrequency: "weekly" },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
