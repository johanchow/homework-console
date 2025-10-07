import request from "./request";
import { Exam } from "@/entity/exam";

export const createExam = async (
  data: Pick<Exam, "goal_id" | "question_ids" | "examinee_id" | "status">
): Promise<Pick<Exam, "id">> => {
  const response = await request.post(`/exam/create`, data);
  return response.data;
};

export const listExams = async (
  filters: Record<string, string | undefined>,
  options: {
    page: number;
    page_size: number;
  }
): Promise<{ exams: Exam[]; total: number }> => {
  const response = await request.get(`/exam/list`, {
    params: { ...filters, ...options },
  });
  return response.data;
};

export const getExam = async (id: string): Promise<Exam> => {
  const response = await request.get(`/exam/get`, {
    params: { id },
  });
  const examData = response.data;
  examData.answer = examData.answer_json
    ? JSON.parse(examData.answer_json)
    : undefined;
  return examData;
};

export const deleteExam = async (id: string): Promise<void> => {
  const response = await request.delete(`/exam/delete`, {
    params: { id },
  });
  return response.data;
};

export const updateExam = async (
  id: string,
  data: Partial<Exam>
): Promise<Exam> => {
  const response = await request.put(`/exam/update`, {
    id,
    ...data,
  });
  return response.data;
};

export const copyExam = async (id: string): Promise<Pick<Exam, "id">> => {
  const response = await request.post(`/exam/copy`, {
    id,
  });
  return response.data;
};
