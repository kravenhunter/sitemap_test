import { MetadataRoute } from "next";
import { StaticImageData } from "next/image";

export const dynamic = "force-dynamic";
export interface ICategory {
  id: number;
  uniqueName: string;
  name: string;
  url: string;
  h1: string;
  title: string;
  description: string;
  logo: string | StaticImageData;
  speciality: { category: { uniqueName: string } };
  vacanciesCount: number;
}
export interface IJobCard {
  id: string;
  tags: string[];
  expanded: boolean;
  categoryUniqueName: string;
  companyName: string;
  position: string;
  jobDescription: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  appendJobDescription: string;
  websiteUrl: string;
  email: string;
  logo: string;
  createdAt: string;
  jobOptions: number[];
  published?: boolean;
  updatedAt?: string;
}
interface IPropsResult {
  jobs: IJobCard[];
  totalJobs: number;
  totalPages: number;
}
export interface IResponse<T> {
  message: string;
  data: T;
  jobs?: T;
}

const BASE_URL = "https://server.realityinvest.ru/api";
const APP_URL = "http://localhost:3000";
export const getJobCardsByCategory = async (category: string, page = 1, count?: number) => {
  try {
    //const jobCards: IResponse<IProps> = await ApiServices.get("/job?size=30&page=1");
    const res = await fetch(BASE_URL + `/job/${category}?size=${count ?? 30}&page=${page}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }
    //  const jobs = (await res.json()) as IResponse<IPropsResult>;
    const jobs: IResponse<IPropsResult> = await res.json();
    return { jobCards: jobs.data.jobs, totalJobs: jobs.data.totalJobs, totalPages: jobs.data.totalPages };
  } catch (error) {
    return { jobCards: null };
  }
};
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

export async function generateSitemaps() {
  const propsCategories = await getCategoryList();
  return propsCategories.categories?.map((el) => ({ id: `${el.uniqueName}_${el.id}` }));
}
const metaData: MetadataRoute.Sitemap = [];

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  // Google's limit is 50,000 URLs per sitemap
  const [category, categoryId] = id.split("_");

  const props = await getJobCardsByCategory(category, 1, 300);

  let jobCards = props.jobCards ?? [];

  if (props.jobCards) {
    for (let index = 2; index <= props.totalPages; index++) {
      const getNewList = await getJobCardsByCategory(category, index, 300);
      getNewList.jobCards && (jobCards = [...jobCards, ...getNewList.jobCards]);
    }

    const vacancyMeta: MetadataRoute.Sitemap = jobCards.map((el) => ({
      url: `${APP_URL}/job/${el.id}`,
      lastModified: el.updatedAt ? el.updatedAt.split("T")[0] : new Date(),
      changeFrequency: "daily",
      priority: 1,
    }));

    return vacancyMeta;
  }
  return metaData;
}
