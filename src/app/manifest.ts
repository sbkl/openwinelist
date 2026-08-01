import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Open Wine List",
    short_name: "OWL",
    description: "Open Wine List",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    scope:
      process.env.VERCEL_ENV === "production"
        ? "https://openwinelist.com"
        : "http://localhost:3000",
    related_applications: [
      {
        platform: "webapp",
        url:
          process.env.VERCEL_ENV === "production"
            ? "https://openwinelist.com/manifest.webmanifest"
            : "http://localhost:3000/manifest.webmanifest",
      },
    ],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
      {
        src: "/assets/favicon-196.png",
        sizes: "196x196",
        type: "image/png",
      },
      {
        src: "/assets/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
