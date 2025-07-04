import { Goal } from './goal'
import { Question } from './question'
import { Message } from './message'

export type Answer = {
  question: {[id: string]: Question};
  answer: {[id: string]: string};
  messages: {[id: string]: Message[]};
}

export enum ExamStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type Exam = {
  id: string;
  goal_id: string;
  question_ids: string[];
  examinee_id: string;
  status: ExamStatus;
  answer?: Answer;
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export type ExamFull = Exam & {
  goal: Goal;
  questions: Question[];
}