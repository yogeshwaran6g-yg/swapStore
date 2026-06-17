import express from 'express';
import { authMiddleware } from '../config/authMiddleware.js';
import { adminLogin, getAdminProfile, getAllSettings, updateSettings } from '../controllers/adminController.js';
const router = express.Router();

router.post('/login', adminLogin);

router.use(authMiddleware);

router.get('/me', getAdminProfile);

router.get('/settings', getAllSettings);
router.put('/settings', updateSettings);

export default router;
