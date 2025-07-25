import { Goal } from "@/entity/goal";
import request from "./request";

export const listGoals = async (
  filters: Record<string, string | undefined>,
  options: {
    page: number;
    page_size: number;
  }
) => {
  const response = await request.get(`/goal/list`, {
    params: {
      ...filters,
      ...options,
    },
  });
  return response.data;
};

export const getGoal = async (id: string): Promise<Goal> => {
  const response = await request.get(`/goal/get`, {
    params: { id },
  });
  return response.data;
};

export const createGoal = async (
  data: Pick<Goal, "name" | "subject" | "creator_id">
): Promise<Pick<Goal, "id">> => {
  const response = await request.post(`/goal/create`, data);
  return response.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  const response = await request.delete(`/goal/delete`, {
    params: { id },
  });
  return response.data;
};
