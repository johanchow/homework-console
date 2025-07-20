import request from "./request";
import { Exam } from "@/entity/exam";

export const createExam = async (
  data: Pick<Exam, "goal_id" | "question_ids" | "examinee_id" | "status">
): Promise<Pick<Exam, "id">> => {
  const response = await request.post(`/exam/create`, data);
  return response.data;
};
