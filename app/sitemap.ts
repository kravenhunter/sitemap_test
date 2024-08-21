import type { MetadataRoute } from "next";
import { ICategory, IResponse } from "./product/sitemap";
const BASE_URL = "https://server.realityinvest.ru/api";
const APP_URL = "http://localhost:3000";
const metaData: MetadataRoute.Sitemap = [
  {
    //Главный роуте "https://iwr.agency"
    url: `${APP_URL}`,
    lastModified: new Date(),
    changeFrequency: "daily",
  },
  {
    url: `${APP_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "never",
  },
  {
    url: `${APP_URL}/add-job`,
    lastModified: new Date(),
    changeFrequency: "never",
  },
  {
    url: `${APP_URL}/search`,
    lastModified: new Date(),
    changeFrequency: "never",
  },
];

export const getCategoryList = async () => {
  try {
    // const categories: IResponse<ICategory[]> = await ApiServices.get("/category");
    const res = await fetch(BASE_URL + `/category`);
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }
    // const categories = (await res.json()) as IResponse<ICategory[]>;
    const categories: IResponse<ICategory[]> = await res.json();
    return { categories: categories.data };
  } catch (error) {
    return { categories: null };
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const propsCategories = await getCategoryList();
  if (propsCategories.categories) {
    const categorySort = propsCategories.categories.filter((el) => el.uniqueName !== "all");
    const categoriesMeta: MetadataRoute.Sitemap = categorySort.map((el) => ({
      //http://localhost:3000/analytics/sitemap.xml/analytics_12
      url: `${APP_URL}/product/sitemap/${el.uniqueName}_${el.id}`,
      // url: `${APP_URL}/product/sitemap.xml/${el.uniqueName}_${el.id}`,
      //url: `${APP_URL}/product/sitemap.xml/${el.uniqueName}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    }));
    metaData.push(...categoriesMeta);
  }
  return metaData;
}
