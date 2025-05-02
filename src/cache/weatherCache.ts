
export const weatherCache = new Map<string, any>();

// Función para agregar datos al cache con expiración
export const setCacheWithExpiration = (key: string, value: any, expirationTime: number) => {
  weatherCache.set(key, value);

  // Establecer un timeout para eliminar el valor después de la expiración
  setTimeout(() => {
    weatherCache.delete(key);
  }, expirationTime);
};
