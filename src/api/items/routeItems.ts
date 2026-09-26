import express from 'express';
import { itemsHandler } from './index.ts';
import { authMiddleware } from '../../middleware/auth.ts';

const router = express.Router();

router.post('/items', authMiddleware, itemsHandler.postItemHandler);
router.get('/items', authMiddleware, itemsHandler.getItemByNameHandler);
router.put('/items/:id', authMiddleware, itemsHandler.putItemHandler);
router.delete('/items/:id', authMiddleware, itemsHandler.deleteItemHandler);

export { router as itemsRouter };