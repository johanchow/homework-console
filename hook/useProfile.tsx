import React, { useEffect } from "react";
import { getQueryClient } from "@/api/query-base/client-query";
import { useUserStore } from "@/store/useUserStore";
import { getCookie } from "@/util/cookie";
import type { User } from "@/entity/user";

export const useProfile = () => {
  const { user, setUser } = useUserStore();
  const queryClient = getQueryClient();
  const cookieUserId = getCookie(process.env.NEXT_PUBLIC_USERID_COOKIE_NAME!);
  let currentUser: User | undefined;
  console.log("cookieUserId: ", cookieUserId);
  if (cookieUserId) {
    currentUser = queryClient.getQueryData<User>(["user", cookieUserId]);
    console.log("currentUser: ", currentUser);
  }

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  return {
    user,
    isAuthenticated: !!user?.id,
  };
};
