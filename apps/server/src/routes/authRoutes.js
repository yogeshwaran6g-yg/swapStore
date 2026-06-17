import express from 'express';
import { getProfile, walletLogin, updateProfile, updateBankDetails } from '../controllers/authController.js';
import { getAllUsers, toggleBlockUser, getUserDetails } from '../controllers/userController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Public — no auth needed
router.post('/walletLogin', walletLogin);

// Protected — requires JWT
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/bank', authMiddleware, updateBankDetails);

// Admin routes
router.get('/admin/users', authMiddleware, getAllUsers);
router.get('/admin/users/:uid', authMiddleware, getUserDetails);
router.post('/admin/users/:uid/block', authMiddleware, toggleBlockUser);

export default router;
