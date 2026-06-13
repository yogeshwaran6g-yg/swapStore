import express from 'express';
import { getProfile, walletLogin } from '../controllers/authController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Public — no auth needed
router.post('/walletLogin', walletLogin);

// Protected — requires JWT
router.get('/profile', authMiddleware, getProfile);

export default router;
