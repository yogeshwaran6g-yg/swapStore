import express from 'express';
import { authMiddleware } from '../config/authMiddleware.js';
import { adminLogin, getAdminProfile, getAllSettings, updateSettings, getDashboardStats } from '../controllers/adminController.js';
const router = express.Router();

router.post('/login', adminLogin);

router.use(authMiddleware);

router.get('/me', getAdminProfile);

router.get('/settings', getAllSettings);
router.put('/settings', updateSettings);

router.get('/dashboard-stats', getDashboardStats);

export default router;
