import { Router } from 'express';
import { weatherCache } from '../cache/weatherCache';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    cacheEntries: Array.from(weatherCache.entries()),
    count: weatherCache.size
  });
});

export default router;