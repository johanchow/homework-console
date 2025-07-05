const request = async <T = any>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(data);
  }
  return data.data;
};

export { request };
