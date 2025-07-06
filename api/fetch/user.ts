import { User } from "@/entity/user";
import { request } from "./request";

const getUserProfile = async (): Promise<User> => {
  const user = await request<User>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
    {}
  );
  console.log("profile response: ", JSON.stringify(user));
  return user;
};

export { getUserProfile };
