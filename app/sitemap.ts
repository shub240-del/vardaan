export const dynamic = "force-static";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://vardaan-tech.web.app";
  const now = new Date();
  return [
    { url: `${site}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
