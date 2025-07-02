import { Question } from './question'
import { Message } from './message'

export type Answer = {
  question: Record<string, Question>;
  messages: Record<string, string | Message[]>;
  answer: Record<string, string>;
}

export type Exam = {
  id: string;
  paper_id: string;
  examinee_id: string;
  answer: Answer;
}
