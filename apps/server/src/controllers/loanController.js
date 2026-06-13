import { uploadKyc, requestLoan, getMyLoans } from '../services/loanService.js';
import { rtnRes } from '../utils/responseUtils.js';

export const handleKycUpload = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return rtnRes(res, 401, 'Unauthorized');
    
    // Using multer, the file is in req.file
    if (!req.file) {
      return rtnRes(res, 400, 'No document uploaded');
    }

    const { documentType } = req.body;
    if (!documentType) return rtnRes(res, 400, 'documentType is required');

    // Simulate saving file locally and getting a URL
    // In a real app, you would move req.file to a public folder
    const fileUrl = `/uploads/${req.file.filename}`;

    const result = await uploadKyc(userUid, fileUrl, documentType);
    if (result.success) {
      return rtnRes(res, 200, 'KYC document uploaded successfully');
    }
    return rtnRes(res, 500, result.error || 'Failed to upload KYC');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const handleLoanRequest = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    const walletAddress = req.user?.wallet_address;
    if (!userUid || !walletAddress) return rtnRes(res, 401, 'Unauthorized');

    const { principalAmount, tokenAddress, network } = req.body;
    if (!principalAmount || !tokenAddress || !network) {
      return rtnRes(res, 400, 'principalAmount, tokenAddress, and network are required');
    }

    const result = await requestLoan(userUid, principalAmount, walletAddress, tokenAddress, network);
    if (result.success) {
      return rtnRes(res, 200, 'Loan requested successfully', result.data);
    }
    return rtnRes(res, 400, result.error || 'Failed to request loan');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const handleGetMyLoans = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return rtnRes(res, 401, 'Unauthorized');

    const result = await getMyLoans(userUid);
    if (result.success) {
      return rtnRes(res, 200, 'Loans fetched successfully', result.data);
    }
    return rtnRes(res, 500, result.error || 'Failed to fetch loans');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const getPendingKyc = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');
    const documents = await queryRunner(
      `SELECT k.id, HEX(k.user_uid) as user_uid, k.document_type, k.document_url, k.status, k.uploaded_at, u.email, u.username
       FROM kyc_documents k
       JOIN users u ON k.user_uid = u.uid
       WHERE k.status = 'pending'`
    );
    return rtnRes(res, 200, 'Fetched KYC documents', { documents });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const approveKyc = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { id } = req.params;
    const { status } = req.body; 
    if (!['approved', 'rejected'].includes(status)) {
      return rtnRes(res, 400, 'Invalid status');
    }

    const { queryRunner } = await import('../config/db.js');
    const docResult = await queryRunner(`SELECT HEX(user_uid) as user_uid FROM kyc_documents WHERE id = ?`, [id]);
    if (!docResult || docResult.length === 0) return rtnRes(res, 404, 'KYC Document not found');
    const userUid = docResult[0].user_uid;

    await queryRunner(`UPDATE kyc_documents SET status = ? WHERE id = ?`, [status, id]);
    await queryRunner(`UPDATE users SET kyc_status = ? WHERE uid = UNHEX(?)`, [status, userUid]);

    return rtnRes(res, 200, `KYC ${status} successfully`);
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const getPendingLoans = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');
    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.user_uid) as user_uid, HEX(l.loan_id) as loan_id, l.principal_amount, l.interest_rate, l.status, l.created_at, u.email, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       WHERE l.status = 'pending'`
    );
    return rtnRes(res, 200, 'Fetched pending loans', { loans });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const approveLoan = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { uid } = req.params; 
    
    const { queryRunner } = await import('../config/db.js');
    const updateResult = await queryRunner(
      `UPDATE loans 
       SET status = 'approved', next_debit_date = DATE_ADD(NOW(), INTERVAL 1 DAY) 
       WHERE uid = UNHEX(?) AND status = 'pending'`,
      [uid]
    );

    if (updateResult && updateResult.affectedRows > 0) {
      return rtnRes(res, 200, 'Loan approved successfully');
    }
    return rtnRes(res, 400, 'Failed to approve loan (maybe not found or already processed)');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const updateInterestRate = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { rate } = req.body;
    if (!rate || isNaN(Number(rate))) {
      return rtnRes(res, 400, 'Invalid rate');
    }

    const { queryRunner } = await import('../config/db.js');
    await queryRunner(
      `INSERT INTO system_settings (setting_key, setting_value) VALUES ('loan_interest_rate', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [rate.toString(), rate.toString()]
    );

    return rtnRes(res, 200, 'Interest rate updated successfully');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};
