import { Goal } from "@/entity/goal";
import { request } from "./request";

const listGoals = async (
  filters: {
    name?: string;
  },
  options: {
    page?: number;
    page_size?: number;
  }
): Promise<{ count: number; goals: Goal[] }> => {
  const query = new URLSearchParams({
    page: String(options.page || 1),
    page_size: String(options.page_size || 15),
  });
  if (filters.name) {
    query.set("name", filters.name);
  }
  console.log("fetch listGoals: ", filters, options);
  const data = await request<{ count: number; goals: Goal[] }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal/list?${query.toString()}`,
    {
      method: "GET",
    }
  );
  console.log(
    "fetch listGoals response: ",
    data.goals.map((goal) => goal.id).join("+")
  );
  return data;
};

const getGoal = async (id: string): Promise<Goal> => {
  const query = new URLSearchParams({ id });
  console.log("fetch getGoal: ", id);
  const data = await request<Goal>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal/get?${query.toString()}`,
    {
      method: "GET",
    }
  );
  console.log("fetch getGoal response: ", data);
  return data;
};

export { listGoals, getGoal };
