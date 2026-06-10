import express from 'express';
import { adminAuth } from '../config/adminAuthMiddleware.js';
import { updateRate } from '../controllers/rateController.js';

import { adminLogin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);

router.use(adminAuth);

router.post('/rates', updateRate);

export default router;
