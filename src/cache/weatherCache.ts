
export const weatherCache = new Map<string, any>();

export const setCacheWithExpiration = (key: string, value: any, expirationTime: number) => {
  weatherCache.set(key, value);

  setTimeout(() => {
    weatherCache.delete(key);
  }, expirationTime);
};
