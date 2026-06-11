import express from 'express';
import { submitSwapForm } from '../controllers/swapController.js';
import { userAuth } from '../config/userAuthMiddleware.js';

const router = express.Router();

// Protected — requires JWT from wallet login
router.post('/swap-form', userAuth, submitSwapForm);

export default router;
