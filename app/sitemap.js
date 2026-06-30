import { absoluteUrl } from "./lib/seo";

export default function sitemap() {
  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" },
    { url: "/docs", priority: 0.9, changeFrequency: "weekly" },
    { url: "/community", priority: 0.8, changeFrequency: "weekly" },
    { url: "/advanced", priority: 0.8, changeFrequency: "weekly" },
    { url: "/standard", priority: 0.8, changeFrequency: "monthly" },
  ];

  return routes.map(({ url, priority, changeFrequency }) => ({
    url: absoluteUrl(url),
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
