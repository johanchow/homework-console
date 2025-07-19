import { create } from "zustand";
import type { User } from "@/entity/user";

interface UserState {
  user: User;
  setUser: (user: User) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "",
    name: "",
    phone: "",
    avatar: "",
  },
  showLoginModal: false,
  setUser: (user) => set({ user }),
  setShowLoginModal: (show) => set({ showLoginModal: show }),
}));
