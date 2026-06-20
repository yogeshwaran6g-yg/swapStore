import express from 'express';
import { submitSwapForm, getAllSwaps, updateSwapStatus, getUserSwaps, confirmSwap } from '../controllers/swapController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Protected — requires JWT
router.post('/swap-form', authMiddleware, submitSwapForm);
router.post('/confirm', authMiddleware, confirmSwap);
router.get('/user/swaps', authMiddleware, getUserSwaps);

// Admin routes
router.get('/admin/swaps', authMiddleware, getAllSwaps);
router.post('/admin/swaps/:orderId/status', authMiddleware, updateSwapStatus);

export default router;
