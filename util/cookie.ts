export const setCookie = (
  name: string,
  value: string,
  options: {
    expires?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
  } = {}
) => {
  if (typeof window === "undefined") return;
  const { expires, path, domain, secure } = options;
  let cookieString = `${name}=${value}`;
  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }
  if (path) {
    cookieString += `; path=${path}`;
  }
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  if (secure) {
    cookieString += "; secure";
  }
  document.cookie = cookieString;
};

export const getCookie = (name: string) => {
  if (typeof window === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
};

export const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  setCookie(name, "", { expires: -1 });
};
