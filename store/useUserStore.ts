import { create } from "zustand";
import type { User } from "@/entity/user";

interface UserState {
  user: User;
  updateUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "",
    name: "",
    phone: "",
    avatar: "",
  },
  updateUser: (user) => set({ user }),
}));
