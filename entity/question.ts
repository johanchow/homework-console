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
  [QuestionType.show]: "表演题",
};

export const questionTypeIcon = {
  [QuestionType.choice]: "🔍",
  [QuestionType.qa]: "💬",
  [QuestionType.judge]: "🔄",
  [QuestionType.reading]: "📖",
  [QuestionType.summary]: "📝",
  [QuestionType.show]: "🎭",
};

export type Question = {
  id: string;
  subject: string;
  type: QuestionType;
  title: string;
  /* 提示或者要求 */
  tip: string;
  options?: string[];
  images?: string[];
  videos?: string[];
  audios?: string[];
  attachments?: string[];
  /* AI提取后的文件内容 */
  file_contents?: Record<string, string>;
  links?: string[];
  answer?: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
};

export default Question;
