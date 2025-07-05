import type { Exam } from './exam';

export enum GoalStatus {
  /* 准备中 */
  preparing = 'preparing',
  /* 进行中 */
  doing = 'doing',
  /* 已通过 */
  passed = 'passed',
  /* 挂起 */
  suspended = 'suspended',
}

export type Goal = {
  id: string;
  name: string;
  /* subject: 学科 */
  subject: string;
  /* status: 状态 */
  status: GoalStatus;
  /* AI出题提示词 */
  ai_prompt: string;
  /* created_at: 创建时间 */
  created_at: string;
  /* updated_at: 更新时间 */
  updated_at: string;
}

export type GoalFull = Goal & {
  exams: Exam[];
}
