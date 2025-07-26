import { request } from "./request";
import { Question, QuestionSubject, QuestionType } from "@/entity/question";
import { FilterParams } from "@/api/typing/question";

export const listQuestions = async (
  params: FilterParams,
  options: {
    page: number;
    page_size: number;
  }
): Promise<{ questions: Question[]; total: number }> => {
  const searchParams = new URLSearchParams();

  if (params.title) searchParams.append("title", params.title);
  if (params.subject) searchParams.append("subject", params.subject);
  if (params.type) searchParams.append("type", params.type);
  if (params.start_date) searchParams.append("start_date", params.start_date);
  if (params.end_date) searchParams.append("end_date", params.end_date);
  if (options.page) searchParams.append("page", options.page.toString());
  if (options.page_size)
    searchParams.append("page_size", options.page_size.toString());

  console.log("fetch listQuestions: ", params, options);
  const data = await request<{ questions: Question[]; total: number }>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/question/list?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );
  console.log(
    "fetch listQuestions data: ",
    data.questions.map((question: Question) => question.id).join("+")
  );

  return data;
};
