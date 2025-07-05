import { Goal } from "@/entity/goal";
import { request } from "./request";

const listGoals = async (filters: {
  page: number;
  page_size: number;
  name?: string;
}): Promise<{ count: number; goals: Goal[] }> => {
  const query = new URLSearchParams({
    page: String(filters.page || 1),
    page_size: String(filters.page_size || 12),
  });
  if (filters.name) {
    query.set("name", filters.name);
  }
  const data = await request<{ count: number; goals: Goal[] }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal/list?${query.toString()}`,
    {
      method: "GET",
    }
  );
  console.log(
    "list goals response: ",
    JSON.stringify(data.goals.map((goal) => goal.id).join("+"))
  );
  return data;
};

export { listGoals };
