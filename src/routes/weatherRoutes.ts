
import { Router } from 'express';
import { getWeather, getAutocomplete, getBulkWeather} from '../controllers/weatherController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkCache } from '../middlewares/cacheMiddleware';

const router = Router();

router.get('/:city', authenticateToken, checkCache, getWeather);

router.get('/autocomplete/:query', authenticateToken, getAutocomplete);

router.post('/bulk', authenticateToken, getBulkWeather); 
export default router;