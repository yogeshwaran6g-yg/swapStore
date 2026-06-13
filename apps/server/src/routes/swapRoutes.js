import express from 'express';
import { submitSwapForm } from '../controllers/swapController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Protected — requires JWT
router.post('/swap-form', authMiddleware, submitSwapForm);

export default router;
