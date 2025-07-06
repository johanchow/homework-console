import request from "./request";
import { Question } from "@/entity/question";

export const batchCreateQuestions = async (
  data: Question[]
): Promise<{ questions: Pick<Question, "id">[] }> => {
  const response = await request.post(`/question/batch-create`, {
    questions: data,
  });
  return response.data;
};
