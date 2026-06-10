import express from 'express';
import { adminAuth } from '../config/adminAuthMiddleware.js';
import { updateRate } from '../controllers/rateController.js';

const router = express.Router();

// We will add admin login here eventually
// router.post('/login', adminLogin);

router.use(adminAuth);

router.post('/rates', updateRate);

export default router;
