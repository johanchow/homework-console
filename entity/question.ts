export enum QuestionType {
  choice = "choice",
  qa = "qa",
  judge = "judge",
  reading = "reading",
  summary = "summary",
  show = "show",
}

export enum QuestionSubject {
  chinese = "chinese",
  math = "math",
  english = "english",
  computer = "computer",
  physics = "physics",
  chemistry = "chemistry",
  history = "history",
  geography = "geography",
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

export const questionSubjectLabel = {
  [QuestionSubject.chinese]: "语文",
  [QuestionSubject.math]: "数学",
  [QuestionSubject.english]: "英语",
  [QuestionSubject.computer]: "计算机科学",
  [QuestionSubject.physics]: "物理",
  [QuestionSubject.chemistry]: "化学",
  [QuestionSubject.history]: "历史",
  [QuestionSubject.geography]: "地理",
};

export type Question = {
  id: string;
  subject: string;
  type: QuestionType;
  title: string;
  /* 提示或者要求 */
  tip: string;
  options?: string[];
  links?: string[];
  images?: string[];
  videos?: string[];
  audios?: string[];
  attachments?: string[];
  /* AI提取后的文件内容 */
  material?: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
};

export default Question;
