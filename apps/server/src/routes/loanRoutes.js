import express from 'express';
import multer from 'multer';
import path from 'path';
import { handleKycUpload, handleLoanRequest, handleGetMyLoans, handleGetEligibility, getPendingKyc, approveKyc, getAllLoans, updateInterestRate, getAdminSettings, adminRunInterestCollection, getCronRunHistory, getActiveLoansUsers, seedTestLoan, deleteTestLoan, updateLoanDetails } from '../controllers/loanController.js';
import { authMiddleware } from '../config/authMiddleware.js';

const router = express.Router();

// Setup Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // We assume there's a public/uploads directory
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// User routes
router.get('/eligibility', handleGetEligibility);
router.post('/kyc', authMiddleware, upload.single('kycDocument'), handleKycUpload);
router.post('/request', authMiddleware, handleLoanRequest);
router.get('/my-loans', authMiddleware, handleGetMyLoans);

// Admin routes
router.get('/admin/kyc', authMiddleware, getPendingKyc);
router.post('/admin/kyc/:id/approve', authMiddleware, approveKyc);
router.get('/admin/loans', authMiddleware, getAllLoans);
router.put('/admin/loans/:loanUid/details', authMiddleware, updateLoanDetails);
router.get('/admin/settings', authMiddleware, getAdminSettings);
router.post('/admin/settings/interest-rate', authMiddleware, updateInterestRate);
router.post('/admin/run-interest-collection', authMiddleware, adminRunInterestCollection);
router.get('/admin/cron-history', authMiddleware, getCronRunHistory);
router.get('/admin/loans-users', authMiddleware, getActiveLoansUsers);

// ── DEV/TEST routes — remove before production ─────────────────────────────
router.post('/admin/test/seed-loan', authMiddleware, seedTestLoan);
router.delete('/admin/test/loans/:loanUid', authMiddleware, deleteTestLoan);

export default router;

