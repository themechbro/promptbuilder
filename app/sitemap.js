// src/app/sitemap.js

export default async function sitemap() {
  const baseUrl = "https://promptbuilder-five.vercel.app/";

  const routes = [
    "",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly",
    priority: 1.0, // Primary core single-page application canvas target
  }));

  return [...routes];
}