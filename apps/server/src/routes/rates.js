import express from 'express';
import { fetchRates, updateRate } from '../controllers/rateController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

router.get('/', fetchRates);
router.post('/admin/rates', authMiddleware, updateRate);

export default router;
