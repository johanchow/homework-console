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

export const generateQuestionsWithPrompt = async (params: {
  ai_prompt: string;
  subject: string;
  count: number;
  session_id?: string;
}): Promise<{ questions: Omit<Question, "id">[]; session_id: string }> => {
  const { ai_prompt, subject, count, session_id } = params;
  const response = await request.post(`/ai/generate-questions`, {
    ai_prompt: ai_prompt,
    subject: subject,
    count: count,
    session_id: session_id,
  });
  return response.data;
};
