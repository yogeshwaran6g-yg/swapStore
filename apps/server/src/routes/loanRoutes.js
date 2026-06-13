import express from 'express';
import multer from 'multer';
import path from 'path';
import { handleKycUpload, handleLoanRequest, handleGetMyLoans } from '../controllers/loanController.js';
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

router.post('/kyc', authMiddleware, upload.single('kycDocument'), handleKycUpload);
router.post('/request', authMiddleware, handleLoanRequest);
router.get('/my-loans', authMiddleware, handleGetMyLoans);

export default router;
