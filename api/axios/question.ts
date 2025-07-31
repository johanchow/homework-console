import request from "./request";
import { Question } from "@/entity/question";
import { FilterParams } from "@/api/typing/question";

export const batchCreateQuestions = async (
  data: Question[]
): Promise<{ questions: Pick<Question, "id">[] }> => {
  const response = await request.post(`/question/batch-create`, {
    questions: data,
  });
  return response.data;
};

export const listQuestions = async (
  filters: FilterParams,
  options: {
    page: number;
    page_size: number;
  }
): Promise<{ questions: Question[]; total: number }> => {
  const response = await request.get(`/question/list`, {
    params: {
      ...filters,
      ...options,
    },
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

export const parseQuestionFromImages = async (params: {
  image_urls: string[];
}): Promise<{ questions: Omit<Question, "id">[] }> => {
  const response = await request.post(
    `/ai/parse-questions-from-images`,
    {
      image_urls: params.image_urls,
    },
    {
      timeout: 50 * 1000,
    }
  );
  return response.data;
};

export const getQuestion = async (id: string): Promise<Question> => {
  const response = await request.get(`/question/get`, {
    params: { id },
  });
  return response.data;
};

export const updateQuestion = async (
  id: string,
  data: Partial<Question>
): Promise<Question> => {
  const response = await request.put(`/question/update`, {
    id,
    ...data,
  });
  return response.data;
};

export const analyzeQuestionMaterial = async (
  question: Question
): Promise<Question> => {
  console.log("analyzeQuestionMaterial", question);
  const response = await request.post(
    `/ai/analyze-question`,
    {
      question,
    },
    {
      timeout: 20 * 1000,
    }
  );

  return response.data.question;
};
