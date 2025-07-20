import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newUuid() {
  // 去掉-符号，生成一个随机id，10位
  return uuidv4().replace(/-/g, "").slice(0, 10);
}
