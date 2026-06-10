import express from 'express';
import { getProfile, submitSwapForm, walletLogin } from '../controllers/userController.js';
import { userAuth } from '../config/userAuthMiddleware.js';

const router = express.Router();

// Public — no auth needed
router.post('/walletLogin', walletLogin);

// Protected — requires JWT from wallet login
router.get('/profile', userAuth, getProfile);
router.post('/swap-form', userAuth, submitSwapForm);

export default router;
