import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const BASE_URL = "https://melkorp.github.io/NordTrail-Travel";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [
    "iceland-budget-2026",
    "norway-hiking-guide",
    "luxury-iceland-hotels",
    "winter-arctic-guide",
    "solo-travel-japan-north",
    "kamchatka-volcanoes",
    "kolsky-peninsula",
    "altai-mountains",
    "baikal-lake",
  ];
  const directions = [
    "iceland",
    "norway",
    "japan",
    "georgia",
    "alps",
    "kamchatka",
    "kola",
    "altai",
    "baikal",
  ];
  const categories = [
    "hiking",
    "luxury",
    "winter",
    "family",
    "budget",
    "solo-travel",
  ];
  const legal = ["privacy-policy", "terms", "cookies"];

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/destinations/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  slugs.forEach((slug) => {
    routes.push({
      url: `${BASE_URL}/blog/${slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  directions.forEach((dir) => {
    routes.push({
      url: `${BASE_URL}/destinations/${dir}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
    routes.push({
      url: `${BASE_URL}/destinations/${dir}/best-time/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
    routes.push({
      url: `${BASE_URL}/destinations/${dir}/cost/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
    routes.push({
      url: `${BASE_URL}/destinations/${dir}/itinerary/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  categories.forEach((cat) => {
    routes.push({
      url: `${BASE_URL}/blog/category/${cat}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  legal.forEach((page) => {
    routes.push({
      url: `${BASE_URL}/${page}/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    });
  });

  return routes;
}
