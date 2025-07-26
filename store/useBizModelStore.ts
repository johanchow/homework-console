import { create } from "zustand";
import type { Exam } from "@/entity/exam";
import type { Goal } from "@/entity/goal";

interface BizModelState {
  currentGoal: Goal | null;
  setCurrentGoal: (goal: Goal | null) => void;
  currentExam: Exam | null;
  setCurrentExam: (exam: Exam | null) => void;
}

export const useBizModelStore = create<BizModelState>((set) => ({
  currentGoal: null,
  setCurrentGoal: (goal) => set({ currentGoal: goal }),
  currentExam: null,
  setCurrentExam: (exam) => set({ currentExam: exam }),
}));
