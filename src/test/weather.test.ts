import { Request, Response } from 'express';
import { getWeather } from '../controllers/weatherController';
import { weatherCache, setCacheWithExpiration } from '../cache/weatherCache';
import { getWeatherByCity } from '../services/weatherService';

jest.mock('../services/weatherService', () => ({
  getWeatherByCity: jest.fn().mockImplementation((city: string) => ({
    current: {
      temp_c: 20,
      temp_f: 68,
      condition: { text: 'Sunny', icon: '//test.com/icon.png' },
      humidity: 50,
      wind_mph: 10,
      wind_dir: 'N',
      feelslike_c: 22,
      feelslike_f: 71.6,
      pressure_mb: 1013,
      pressure_in: 30.4,
      gust_kph: 15,
      vis_km: 10,
      vis_miles: 6,
      dewpoint_c: 15,
      dewpoint_f: 59,
      uv: 5,
      cloud: 20
    },
    location: {
      localtime: '2024-01-01 12:00',
      name: city.split(',')[0].trim(),
      country: city.split(',')[1]?.trim() || ''
    }
  }))
}));

jest.mock('../cache/weatherCache', () => ({
  weatherCache: {
    has: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn()
  },
  setCacheWithExpiration: jest.fn()
}));

const mockRequest = (params: { city?: string } = {}) => ({
  params
}) as Request;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

describe('Weather Controller - getWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (weatherCache.clear as jest.Mock).mockImplementation(() => {});
  });

  test('Debería devolver datos desde caché si existen', async () => {
    // Configurar mocks de caché
    const cachedData = {
      city: 'Madrid',
      temperature: { celsius: 20, fahrenheit: 68 },
      condition: 'Sunny',
      conditionIcon: 'https://test.com/icon.png',
      humidity: 50,
      windSpeed: 10,
      windDirection: 'N',
      localTime: '2024-01-01 12:00',
      timestamp: expect.any(String),
      feelslike_c: 22,
      feelslike_f: 71.6,
      pressure_mb: 1013,
      pressure_in: 30.4,
      gust_kph: 15,
      vis_km: 10,
      vis_miles: 6,
      dewpoint_c: 15,
      dewpoint_f: 59,
      uv: 5,
      cloud: 20
    };

    (weatherCache.has as jest.Mock).mockReturnValue(true);
    (weatherCache.get as jest.Mock).mockReturnValue(cachedData);

    const req = mockRequest({ city: 'Madrid' });
    const res = mockResponse();

    await getWeather(req, res);

    expect(res.json).toHaveBeenCalledWith({
      ...cachedData,
      fromCache: true,
      timestamp: expect.any(String)
    });
  });

  test('Debería obtener nuevos datos y guardar en caché', async () => {
    (weatherCache.has as jest.Mock).mockReturnValue(false);
    
    const req = mockRequest({ city: 'Barcelona,ES' });
    const res = mockResponse();

    await getWeather(req, res);

    expect(getWeatherByCity).toHaveBeenCalledWith('Barcelona,ES');
    expect(setCacheWithExpiration).toHaveBeenCalledWith(
      'barcelona,es',
      expect.objectContaining({
        city: 'Barcelona, ES',
        temperature: {
          celsius: 20,
          fahrenheit: 68
        }
      }),
      900000
    );
  });
});