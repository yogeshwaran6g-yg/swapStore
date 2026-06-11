import express from 'express';
import { getProfile, walletLogin } from '../controllers/authController.js';
import { userAuth } from '../config/userAuthMiddleware.js';

const router = express.Router();

// Public — no auth needed
router.post('/walletLogin', walletLogin);

// Protected — requires JWT from wallet login
router.get('/profile', userAuth, getProfile);

export default router;

