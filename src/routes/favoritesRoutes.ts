
import { Router } from 'express';
import { getFavorites, addFavorite, deleteFavorite,checkFavorite } from '../controllers/favoritesController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router
  .route('/')
  .get(authenticateToken, getFavorites)
  .post(authenticateToken, addFavorite);

router.delete('/:city', authenticateToken, deleteFavorite);
router.get('/check', authenticateToken, checkFavorite);

export default router;