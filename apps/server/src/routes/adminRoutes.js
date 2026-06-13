import express from 'express';
import { authMiddleware } from '../config/authMiddleware.js';
import { updateRate } from '../controllers/rateController.js';
import { adminLogin, getAdminProfile } from '../controllers/adminController.js';
import { getPendingKyc, approveKyc, getPendingLoans, approveLoan, updateInterestRate } from '../controllers/loanController.js';
import { getAllSwaps, updateSwapStatus } from '../controllers/swapController.js';

const router = express.Router();

router.post('/login', adminLogin);

router.use(authMiddleware);

router.get('/me', getAdminProfile);
router.post('/rates', updateRate);

// Swap management
router.get('/swaps', getAllSwaps);
router.post('/swaps/:orderId/status', updateSwapStatus);

// Loan & KYC management
router.get('/kyc', getPendingKyc);
router.post('/kyc/:id/approve', approveKyc);
router.get('/loans', getPendingLoans);
router.post('/loans/:uid/approve', approveLoan);
router.post('/settings/interest-rate', updateInterestRate);

export default router;
