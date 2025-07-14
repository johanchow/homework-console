export enum QuestionType {
  choice = "choice",
  qa = "qa",
  judge = "judge",
  reading = "reading",
  summary = "summary",
  show = "show",
}

export type Question = {
  id: string;
  subject: string;
  type: QuestionType;
  title: string;
  options?: string[];
  images?: string[];
  videos?: string[];
  audios?: string[];
  answer?: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
};

export default Question;
