import { Goal } from "./goal";
import { Question } from "./question";
import { Message } from "./message";

export type Answer = {
  question: { [id: string]: Question };
  answers: { [id: string]: string };
  messages: { [id: string]: Message[] };
};

export enum ExamStatus {
  PREPARING = "preparing",
  COMPLETED = "completed",
  FAILED = "failed",
  PENDING = "pending",
}

export type Exam = {
  id: string;
  goal_id?: string;
  title: string;
  question_ids: string[];
  questions: Question[];
  examinee_id: string;
  status: ExamStatus;
  plan_duration: number;
  plan_starttime: string;
  actual_starttime?: string;
  actual_duration?: number;
  answer?: Answer;
  answer_json?: string;
  created_at: string;
  updated_at: string;
  finished_at?: string;
};
