// src/middlewares/cacheMiddleware.ts
import { RequestHandler } from 'express';
import { weatherCache } from '../cache/weatherCache';

export const checkCache: RequestHandler = (req, res, next) => {
  const { city } = req.params;

  if (!city) {
    res.status(400).json({ error: 'Parámetro city requerido' });
    return;
  }

  let cityName = city.trim();
  let countryCode = '';


  if (cityName.includes(',')) {
    const parts = cityName.split(',');
    cityName = parts[0].trim();
    countryCode = parts[1].trim();
  }

  const cacheKey = countryCode ? `${cityName.toLowerCase()},${countryCode.toLowerCase()}` : cityName.toLowerCase();

  
  if (weatherCache.has(cacheKey)) {
    const data = weatherCache.get(cacheKey);
    res.json({ ...data, fromCache: true });
    return;
  }


  next();
};
