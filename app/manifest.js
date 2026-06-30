import { defaultDescription, siteName, siteShortName } from "./lib/seo";

export default function manifest() {
  return {
    name: siteName,
    short_name: siteShortName,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/logo/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
