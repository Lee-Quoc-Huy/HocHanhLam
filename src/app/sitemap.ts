import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hochanhlam.vercel.app";

  const routes = [
    "",
    "/vocabulary",
    "/grammar",
    "/flashcards",
    "/ai-tutor",
    "/documents",
    "/learning",
    "/library",
    "/settings",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" || route === "/vocabulary" ? 1.0 : 0.8,
  }));
}
