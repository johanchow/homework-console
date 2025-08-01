import { Exam } from "@/entity/exam";
import { request } from "./request";

const listExams = async (
  filters: Record<string, string | undefined>,
  options: {
    page: number;
    page_size: number;
  }
) => {
  const query = new URLSearchParams({
    page: String(options.page || 1),
    page_size: String(options.page_size || 15),
  });
  if (filters.goal_id) {
    query.set("goal_id", filters.goal_id);
  }
  if (filters.examinee_id) {
    query.set("examinee_id", filters.examinee_id);
  }
  console.log("fetch listExams: ", filters, options);
  const data = await request<{ count: number; exams: Exam[] }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exam/list?${query.toString()}`,
    {
      method: "GET",
    }
  );
  console.log(
    "fetch listExams response: ",
    data.exams.map((exam) => exam.id).join("+")
  );
  return data;
};

const getExam = async (id: string): Promise<Exam> => {
  const query = new URLSearchParams({
    id,
  });
  console.log("fetch getExam: ", id);
  const data = await request<Exam>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exam/get?${query.toString()}`,
    {
      method: "GET",
    }
  );
  console.log("fetch getExam response: ", data);
  return data;
};

const deleteExam = async (id: string): Promise<void> => {
  const query = new URLSearchParams({
    id,
  });
  console.log("fetch deleteExam: ", id);
  await request(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/exam/delete?${query.toString()}`,
    {
      method: "DELETE",
    }
  );
  console.log("fetch deleteExam response: success");
};

export { listExams, getExam, deleteExam };
