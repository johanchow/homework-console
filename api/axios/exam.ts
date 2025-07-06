import request from "./request";
import { Exam } from "@/entity/exam";

export const createExam = async (
  data: Pick<Exam, "goal_id" | "question_id_list" | "examinee_id" | "status">
): Promise<Pick<Exam, "id">> => {
  const response = await request.post(`/exam/create`, data);
  return response.data;
};
