import express from 'express';
import { submitSwapForm, getAllSwaps, updateSwapStatus } from '../controllers/swapController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Protected — requires JWT
router.post('/swap-form', authMiddleware, submitSwapForm);

// Admin routes
router.get('/admin/swaps', authMiddleware, getAllSwaps);
router.post('/admin/swaps/:orderId/status', authMiddleware, updateSwapStatus);

export default router;
