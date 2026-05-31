export default function sitemap() {
  const base = "https://promptbuilder-five.vercel.app"; // update to your domain

  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" },
    { url: "/docs", priority: 0.9, changeFrequency: "weekly" },
    { url: "/standard", priority: 0.8, changeFrequency: "monthly" },
    { url: "/advanced", priority: 0.8, changeFrequency: "monthly" },
    { url: "/community", priority: 0.7, changeFrequency: "weekly" },
    { url: "/manage", priority: 0.6, changeFrequency: "monthly" },
    { url: "/settings", priority: 0.4, changeFrequency: "monthly" },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
