import { uploadKyc, requestLoan, getMyLoans, getSystemSettings } from '../services/loanService.js';
import { runInterestCollection } from '../services/cronService.js';
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

export const handleGetEligibility = async (req, res) => {
  try {
    const tiersStr = await getSystemSettings('loan_eligibility_tiers');
    let tiers = [];
    try {
      if (tiersStr) tiers = JSON.parse(tiersStr);
    } catch (e) {
      console.error('Error parsing tiers JSON:', e);
    }
    return rtnRes(res, 200, 'Loan eligibility fetched successfully', { tiers });
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
      return rtnRes(res, 200, 'Loan requested successfully', result);
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
      return rtnRes(res, 200, 'Loans fetched successfully', result);
    }
    return rtnRes(res, 500, result.error || 'Failed to fetch loans');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

// ── Admin Controllers ───────────────────────────────────────

export const getPendingKyc = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');
    const documents = await queryRunner(
      `SELECT k.id, HEX(k.user_uid) as user_uid, k.document_type, k.document_url, k.status, k.uploaded_at, u.email, u.username
       FROM user_kyc_documents k
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
    const docResult = await queryRunner(`SELECT HEX(user_uid) as user_uid FROM user_kyc_documents WHERE id = ?`, [id]);
    if (!docResult || docResult.length === 0) return rtnRes(res, 404, 'KYC Document not found');
    const userUid = docResult[0].user_uid;

    await queryRunner(`UPDATE user_kyc_documents SET status = ? WHERE id = ?`, [status, id]);
    await queryRunner(`UPDATE users SET kyc_status = ? WHERE uid = UNHEX(?)`, [status, userUid]);

    return rtnRes(res, 200, `KYC ${status} successfully`);
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const getAllLoans = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');
    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.user_uid) as user_uid, HEX(l.loan_id) as loan_id,
              l.principal_amount, l.interest_rate, l.token_symbol, l.token_address, l.network, l.status, l.created_at,
              u.email, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       ORDER BY l.created_at DESC`
    );

    const ledgers = await queryRunner(
      `SELECT id, HEX(loan_uid) as loan_uid, interest_amount, interest_rate, principal_at_time, 
              period_start, period_end, collection_status, tx_hash, failure_reason, collected_at, created_at
       FROM loan_interest_ledger ORDER BY created_at DESC`
    );

    const loansWithLedger = loans.map((loan) => {
      loan.ledger = ledgers.filter((l) => l.loan_uid === loan.uid);
      return loan;
    });

    return rtnRes(res, 200, 'Fetched all loans', { loans: loansWithLedger });
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

/**
 * Admin: Trigger interest collection manually for all users or a specific user/loan.
 */
export const adminRunInterestCollection = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');

    const { targetUserUid, targetLoanUid } = req.body || {};
    
    const hexRegex = /^[0-9a-fA-F]{32,64}$/;
    
    if (targetUserUid) {
      if (typeof targetUserUid !== 'string' || !hexRegex.test(targetUserUid)) {
        return rtnRes(res, 400, 'Invalid targetUserUid format. Must be a valid hex string.');
      }
      const { queryRunner } = await import('../config/db.js');
      const userExists = await queryRunner(`SELECT 1 FROM users WHERE uid = UNHEX(?)`, [targetUserUid]);
      if (!userExists || userExists.length === 0) {
        return rtnRes(res, 404, 'User not found in the database.');
      }
    }
    
    if (targetLoanUid) {
      if (typeof targetLoanUid !== 'string' || !hexRegex.test(targetLoanUid)) {
        return rtnRes(res, 400, 'Invalid targetLoanUid format. Must be a valid hex string.');
      }
    }

    const runType = targetUserUid || targetLoanUid ? 'admin_specific' : 'admin_all';
    const adminId = req.user.id;

    const result = await runInterestCollection(runType, adminId, targetUserUid || null, targetLoanUid || null);
    return rtnRes(res, 200, 'Interest collection completed', result);
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

/**
 * Admin: Get cron run history with admin username who triggered it.
 */
export const getCronRunHistory = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');

    const runs = await queryRunner(
      `SELECT cr.id, cr.run_type, cr.triggered_by, a.username as triggered_by_username,
              HEX(cr.target_user_uid) as target_user_uid, HEX(cr.target_loan_uid) as target_loan_uid,
              cr.run_status, cr.total_loans_processed, cr.successful_collections,
              cr.failed_collections, cr.overdue_flagged, cr.total_interest_collected,
              cr.error_log, cr.started_at, cr.completed_at
       FROM loan_cron_runs cr
       LEFT JOIN admins a ON cr.triggered_by = a.id
       ORDER BY cr.started_at DESC
       LIMIT 100`
    );

    return rtnRes(res, 200, 'Cron run history fetched', { runs });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

/**
 * Admin: Get distinct users who have active/approved loans (for targeted cron runs).
 */
export const getActiveLoansUsers = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    const { queryRunner } = await import('../config/db.js');

    const users = await queryRunner(
      `SELECT DISTINCT HEX(u.uid) as uid, u.email, u.wallet_address, u.username,
              COUNT(l.uid) as active_loan_count
       FROM users u
       JOIN loans l ON u.uid = l.user_uid
       WHERE l.status IN ('approved', 'active')
       GROUP BY u.uid, u.email, u.wallet_address, u.username
       ORDER BY u.email`
    );

    return rtnRes(res, 200, 'Active loan users fetched', { users });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};
