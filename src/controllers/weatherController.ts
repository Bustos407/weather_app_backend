import { Request, Response } from 'express';
import { weatherCache, setCacheWithExpiration } from '../cache/weatherCache';
import { getWeatherByCity, getCitySuggestions } from '../services/weatherService';

const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutos

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  const { city } = req.params;

  if (!city?.trim()) {
    res.status(400).json({ error: 'Se requiere el parámetro city' });
    return;
  }

  const [cityName, countryCode] = city.split(',').map(s => s.trim());
  const cacheKey = countryCode 
    ? `${cityName.toLowerCase()},${countryCode.toLowerCase()}`
    : cityName.toLowerCase();

  if (weatherCache.has(cacheKey)) {
    const cachedData = weatherCache.get(cacheKey);
    res.json({ ...cachedData, fromCache: true });
    return;
  }

  try {
    const data = await getWeatherByCity(city);
    
    const weatherData = {
      city: `${cityName}${countryCode ? `, ${countryCode.toUpperCase()}` : ''}`,
      temperature: {
        celsius: data.current.temp_c,
        fahrenheit: data.current.temp_f
      },
      condition: data.current.condition.text,
      conditionIcon: `https:${data.current.condition.icon}`,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_mph,
      windDirection: data.current.wind_dir,
      localTime: data.location.localtime,
      timestamp: new Date().toISOString(),
      feelslike_c: data.current.feelslike_c,
      feelslike_f: data.current.feelslike_f,
      pressure_mb: data.current.pressure_mb,
      pressure_in: data.current.pressure_in,
      gust_kph: data.current.gust_kph,
      vis_km: data.current.vis_km,
      vis_miles: data.current.vis_miles,
      dewpoint_c: data.current.dewpoint_c,
      dewpoint_f: data.current.dewpoint_f,
      uv: data.current.uv,
      cloud: data.current.cloud
    };

    setCacheWithExpiration(cacheKey, weatherData, CACHE_EXPIRATION);
    res.json(weatherData);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Error al obtener datos del clima',
      details: error.message || 'Desconocido' 
    });
  }
};

export const getAutocomplete = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.params;

  if (!query?.trim() || query.trim().length < 3) {
    res.status(400).json({ error: 'Se requiere un término de búsqueda de al menos 3 caracteres' });
    return;
  }

  try {
    const suggestions = await getCitySuggestions(query);

    const formattedSuggestions = suggestions.map((loc: any) => ({
      name: loc.name,
      country: loc.country,
      region: loc.region
    }));

    res.json(formattedSuggestions);
  } catch (error: any) {
    console.error('Error en autocompletado:', error);
    res.status(500).json({ error: 'Error en servicio de autocompletado' });
  }
};


export const getBulkWeather = async (req: Request, res: Response): Promise<void> => {
  const { cities } = req.body;

  if (!Array.isArray(cities)) {
    res.status(400).json({ error: 'Formato inválido, se requiere array de ciudades' });
    return;
  }

  try {
    const weatherResults = [];
    
    for (const cityStr of cities) {
      const [cityName, countryCode] = cityStr.split(',').map((s: string) => s.trim());
      const cacheKey = countryCode ? `${cityName.toLowerCase()},${countryCode.toLowerCase()}` : cityName.toLowerCase();

      if (weatherCache.has(cacheKey)) {
        weatherResults.push(weatherCache.get(cacheKey));
        continue;
      }

      const data = await getWeatherByCity(cityStr);
      const weatherData = {
        city: `${cityName}${countryCode ? ', ' + countryCode : ''}`,
        temperature: { celsius: data.current.temp_c,
          fahrenheit: data.current.temp_f
         }, 
        
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        localTime: data.location.localtime,
        condition: data.current.condition.text
      };

      setCacheWithExpiration(cacheKey, weatherData, CACHE_EXPIRATION);
      weatherResults.push(weatherData);
    }

    res.json(weatherResults);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Error al obtener datos múltiples',
      details: error.message 
    });
  }
};
