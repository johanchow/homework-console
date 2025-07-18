export enum QuestionType {
  choice = "choice",
  qa = "qa",
  judge = "judge",
  reading = "reading",
  summary = "summary",
  show = "show",
}

export const questionTypeLabel = {
  [QuestionType.choice]: "选择题",
  [QuestionType.qa]: "问答题",
  [QuestionType.judge]: "判断题",
  [QuestionType.reading]: "阅读题",
  [QuestionType.summary]: "总结题",
  [QuestionType.show]: "展示题",
};

export type Question = {
  id: string;
  subject: string;
  type: QuestionType;
  title: string;
  options?: string[];
  images?: string[];
  videos?: string[];
  audios?: string[];
  attachments?: string[];
  links?: string[];
  answer?: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
};

export default Question;
