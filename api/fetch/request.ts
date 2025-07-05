import { cookies } from "next/headers";

const request = async <T = any>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.NEXT_PUBLIC_COOKIE_NAME_TOKEN!
  )?.value;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(data);
  }
  return data.data;
};

export { request };
