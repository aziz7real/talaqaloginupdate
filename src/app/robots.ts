import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The dashboard and sign-in are private (and noindex on the page too).
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/ar/dashboard", "/en/dashboard", "/ar/login", "/en/login"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
