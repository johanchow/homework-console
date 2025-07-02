import { Question } from './question'

export type Paper = {
  id: string;
  title: string;
  description: string;
  question_ids: string[];
  questions: Question[];
  creator_id: string;
  created_at: Date;
  updated_at: Date;
}