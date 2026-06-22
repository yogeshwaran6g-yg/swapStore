import { uploadKyc, requestLoan, getMyLoans, getSystemSettings } from '../services/loanService.js';
import { runInterestCollection } from '../services/cronService.js';
import { rtnRes } from '../utils/responseUtils.js';
import { queryRunner } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await queryRunner(
      `SELECT COUNT(*) as total FROM user_kyc_documents`
    );

    const documents = await queryRunner(
      `SELECT k.id, HEX(k.user_uid) as user_uid, k.document_type, k.document_url, k.status, k.uploaded_at, u.email, u.username
       FROM user_kyc_documents k
       JOIN users u ON k.user_uid = u.uid
       ORDER BY k.uploaded_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rtnRes(res, 200, 'Fetched KYC documents', {
      documents,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
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

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await queryRunner('SELECT COUNT(*) as total FROM loans');

    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.user_uid) as user_uid, HEX(l.loan_id) as loan_id,
              l.principal_amount, l.interest_rate, l.loan_term_days, l.token_symbol, l.token_address, l.network, l.status, l.created_at,
              u.email, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const loansUids = loans.map(l => l.uid);
    let loansWithLedger = loans.map(loan => ({ ...loan, ledger: [] }));

    if (loansUids.length > 0) {
      const placeholders = loansUids.map(() => 'UNHEX(?)').join(',');
      const ledgers = await queryRunner(
        `SELECT id, HEX(loan_uid) as loan_uid, interest_amount, interest_rate, principal_at_time, 
                period_start, period_end, collection_status, tx_hash, failure_reason, collected_at, created_at
         FROM loan_interest_ledger WHERE loan_uid IN (${placeholders}) ORDER BY created_at DESC`,
        loansUids
      );
      loansWithLedger = loans.map(loan => ({
        ...loan,
        ledger: ledgers.filter(l => l.loan_uid === loan.uid)
      }));
    }

    return rtnRes(res, 200, 'Fetched all loans', {
      loans: loansWithLedger,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const updateLoanDetails = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    
    const { loanUid } = req.params;
    const { interestRate, loanTermDays } = req.body;
    
    if (!loanUid) return rtnRes(res, 400, 'loanUid is required');
    
    const updates = [];
    const params = [];
    
    if (interestRate !== undefined) {
      if (isNaN(Number(interestRate))) return rtnRes(res, 400, 'Invalid interest rate');
      updates.push('interest_rate = ?');
      params.push(Number(interestRate));
    }
    
    if (loanTermDays !== undefined) {
      if (isNaN(Number(loanTermDays))) return rtnRes(res, 400, 'Invalid loan term days');
      updates.push('loan_term_days = ?');
      params.push(Number(loanTermDays));
    }
    
    if (updates.length === 0) {
      return rtnRes(res, 400, 'No fields to update');
    }
    
    params.push(loanUid);
    
    const result = await queryRunner(
      `UPDATE loans SET ${updates.join(', ')} WHERE uid = UNHEX(?) AND status = 'pending'`,
      params
    );
    
    if (result.affectedRows === 0) {
      return rtnRes(res, 404, 'Pending loan not found or no changes made');
    }
    
    return rtnRes(res, 200, 'Loan details updated successfully');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const adminApproveLoan = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    
    const { loanUid } = req.params;
    const { disbursementTxHash, disbursementFee } = req.body;
    
    if (!loanUid || !disbursementTxHash) {
      return rtnRes(res, 400, 'loanUid and disbursementTxHash are required');
    }

    const { getSystemSettings } = await import('../services/loanService.js');
    
    // Fetch loan details to calculate amounts and dates
    const loanQuery = await queryRunner(
      `SELECT HEX(loan_id) as loan_id, principal_amount, loan_term_days, status FROM loans WHERE uid = UNHEX(?) LIMIT 1`,
      [loanUid]
    );

    if (!loanQuery || loanQuery.length === 0) {
      return rtnRes(res, 404, 'Loan not found');
    }

    const loan = loanQuery[0];
    if (loan.status !== 'pending') {
      return rtnRes(res, 400, `Loan is already ${loan.status}`);
    }

    const principal = Number(loan.principal_amount);
    const fee = Number(disbursementFee || 0);
    const disbursedAmount = Math.max(0, principal - fee);

    const specificTermDays = Number(loan.loan_term_days);
    const frequencyDays = Number(await getSystemSettings('loan_interest_frequency_days')) || 30;
    const termDays = specificTermDays || Number(await getSystemSettings('loan_default_term_days')) || 30;
    
    const nextDebit = new Date(Date.now() + frequencyDays * 24 * 60 * 60 * 1000);
    const maturity = new Date(Date.now() + termDays * 24 * 60 * 60 * 1000);

    const result = await queryRunner(
      `UPDATE loans 
       SET status = 'approved', disbursement_tx_hash = ?, disbursed_at = NOW(),
           disbursed_amount = ?, disbursement_fee = ?, next_debit_date = ?, maturity_date = ?, updated_at = NOW()
       WHERE uid = UNHEX(?) AND status = 'pending'`,
      [disbursementTxHash, String(disbursedAmount), String(fee), nextDebit, maturity, loanUid]
    );

    if (result?.affectedRows > 0) {
      return rtnRes(res, 200, 'Loan approved successfully via API');
    }
    
    return rtnRes(res, 400, 'Failed to approve loan or already approved');
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

export const adminRejectLoan = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');
    
    const { loanUid } = req.params;
    
    if (!loanUid) {
      return rtnRes(res, 400, 'loanUid is required');
    }

    const result = await queryRunner(
      `UPDATE loans SET status = 'rejected', updated_at = NOW() WHERE uid = UNHEX(?) AND status = 'pending'`,
      [loanUid]
    );

    if (result?.affectedRows > 0) {
      return rtnRes(res, 200, 'Loan rejected successfully');
    }
    
    return rtnRes(res, 404, 'Pending loan not found or already processed');
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

export const getAdminSettings = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');

    const rows = await queryRunner(
      `SELECT setting_key, setting_value FROM system_settings ORDER BY setting_key`
    );

    // Convert array to key→value object for easy consumption
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }

    return rtnRes(res, 200, 'Settings fetched', { settings });
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

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [{ total }] = await queryRunner('SELECT COUNT(*) as total FROM loan_cron_runs');

    const runs = await queryRunner(
      `SELECT cr.id, cr.run_type, cr.triggered_by, a.username as triggered_by_username,
              HEX(cr.target_user_uid) as target_user_uid, HEX(cr.target_loan_uid) as target_loan_uid,
              cr.run_status, cr.total_loans_processed, cr.successful_collections,
              cr.failed_collections, cr.overdue_flagged, cr.total_interest_collected,
              cr.error_log, cr.started_at, cr.completed_at
       FROM loan_cron_runs cr
       LEFT JOIN admins a ON cr.triggered_by = a.id
       ORDER BY cr.started_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rtnRes(res, 200, 'Cron run history fetched', {
      runs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
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


// ── DEV/TEST ONLY ─────────────────────────────────────────────────────────────
// Bypass loan used to test cron, interest, overdue, repayment flows without
// needing real on-chain balance or KYC approval.
// Remove or gate behind NODE_ENV=development before going to production.

/**
 * POST /api/v1/loan/admin/test/seed-loan
 *
 * Seeds a fully-ready test loan for a specific wallet user:
 *  1. Finds the user by walletAddress
 *  2. Creates a KYC document (approved) for them if none exists
 *  3. Sets user kyc_status = 'approved'
 *  4. Inserts a loan in 'active' status with next_debit_date = NOW()
 *     so the very next cron run picks it up immediately
 *
 * Body:
 *   walletAddress   string  (required) — the client user's wallet to seed the loan for
 *   tokenSymbol     string  — 'USDT' | 'USDC' | 'DAI'  (default: 'USDT')
 *   tokenAddress    string  (required) — ERC20 token contract address
 *   network         string  — 'bsc' | 'polygon'          (default: 'bsc')
 *   principalAmount number  — default: 100
 *   interestRate    number  — default: 5 (%)
 *   pastGracePeriod boolean — false: next_debit_date = NOW() (cron attempts collection)
 *                             true:  next_debit_date = 10 days ago (cron marks overdue instantly)
 */
export const seedTestLoan = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');

    const {
      walletAddress,
      tokenSymbol     = 'USDT',
      tokenAddress,
      network         = 'bsc',
      principalAmount = 100,
      interestRate    = 5,
      pastGracePeriod = false,
    } = req.body;

    if (!walletAddress)  return rtnRes(res, 400, 'walletAddress is required');
    if (!tokenAddress)   return rtnRes(res, 400, 'tokenAddress is required');

    // ── 1. Find user by wallet address ──────────────────────────────────────
    const users = await queryRunner(
      `SELECT HEX(uid) as uid, kyc_status FROM users WHERE LOWER(wallet_address) = LOWER(?) LIMIT 1`,
      [walletAddress]
    );
    if (!users || users.length === 0) {
      return rtnRes(res, 404, `No user found with wallet address ${walletAddress}`);
    }
    const targetUser = users[0];
    const targetUid  = targetUser.uid;

    // ── 2. Auto-approve KYC ──────────────────────────────────────────────────
    // Insert a dummy KYC doc if none exists, then mark user as approved
    const existingKyc = await queryRunner(
      `SELECT id FROM user_kyc_documents WHERE user_uid = UNHEX(?) LIMIT 1`,
      [targetUid]
    );
    if (!existingKyc || existingKyc.length === 0) {
      await queryRunner(
        `INSERT INTO user_kyc_documents (user_uid, document_type, document_url, status)
         VALUES (UNHEX(?), 'test_bypass', '/uploads/test_bypass.jpg', 'approved')`,
        [targetUid]
      );
    } else {
      // Update existing doc to approved
      await queryRunner(
        `UPDATE user_kyc_documents SET status = 'approved' WHERE user_uid = UNHEX(?)`,
        [targetUid]
      );
    }
    await queryRunner(
      `UPDATE users SET kyc_status = 'approved' WHERE uid = UNHEX(?)`,
      [targetUid]
    );

    // ── 3. Resolve dates ─────────────────────────────────────────────────────
    const now = new Date();

    // pastGracePeriod=true  → 10 days ago → cron immediately marks overdue
    // pastGracePeriod=false → NOW()       → cron attempts collection on first run
    const debitDate = pastGracePeriod
      ? new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      : new Date(now);

    const maturityDate = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days

    // ── 4. Insert loan ───────────────────────────────────────────────────────
    const loanUid   = uuidv4().replace(/-/g, '');
    const hexLoanId = uuidv4().replace(/-/g, '');

    await queryRunner(
      `INSERT INTO loans
         (uid, user_uid, loan_id,
          principal_amount, outstanding_principal,
          interest_rate, token_symbol, token_address,
          network, loan_term_days, maturity_date,
          next_debit_date, status)
       VALUES
         (UNHEX(?), UNHEX(?), UNHEX(?),
          ?, ?,
          ?, ?, ?,
          ?, 30, ?,
          ?, 'active')`,
      [
        loanUid, targetUid, hexLoanId,
        principalAmount, principalAmount,
        interestRate, tokenSymbol, tokenAddress,
        network, maturityDate,
        debitDate,
      ]
    );

    return rtnRes(res, 200, 'Test loan seeded — ready for cron', {
      targetWallet:   walletAddress,
      targetUserUid:  targetUid,
      loanUid,
      loanId:         hexLoanId,
      network,
      tokenSymbol,
      tokenAddress,
      principalAmount,
      interestRate,
      status:         'active',
      nextDebitDate:  debitDate.toISOString(),
      maturityDate:   maturityDate.toISOString(),
      kycStatus:      'approved',
      note: pastGracePeriod
        ? 'next_debit_date = 10 days ago → cron will mark this overdue immediately on next run'
        : 'next_debit_date = NOW → cron will attempt interest collection on next run',
    });
  } catch (err) {
    console.error('seedTestLoan error:', err);
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

/**
 * DELETE /api/v1/loan/admin/test/loans/:loanUid
 * Permanently removes a test loan and its ledger entries (cascade).
 */
export const deleteTestLoan = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');

    const { loanUid } = req.params;
    if (!loanUid) return rtnRes(res, 400, 'loanUid param required');

    await queryRunner(`DELETE FROM loans WHERE uid = UNHEX(?)`, [loanUid]);

    return rtnRes(res, 200, 'Test loan deleted', { loanUid });
  } catch (err) {
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

/**
 * POST /api/v1/loan/repay/confirm
 * Called by the frontend immediately after the user's repayPrincipal wallet tx.
 * Verifies the receipt, decodes PrincipalRepaid, and updates the DB.
 * Idempotent — safe if listener fires later for the same tx.
 */
export const confirmRepayment = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return rtnRes(res, 401, 'Unauthorized');

    const { txHash, loanUid } = req.body;
    if (!txHash || !loanUid) {
      return rtnRes(res, 400, 'txHash and loanUid are required');
    }

    // Idempotency: if this tx_hash is already recorded, return success immediately
    const existing = await queryRunner(
      `SELECT id FROM loan_principal_payments WHERE tx_hash = ? LIMIT 1`,
      [txHash]
    );
    if (existing && existing.length > 0) {
      return rtnRes(res, 200, 'Repayment already recorded');
    }

    // Fetch the loan to get network, token details
    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.loan_id) as loan_id, HEX(l.user_uid) as user_uid,
              l.outstanding_principal, l.principal_amount, l.network, l.token_address,
              l.token_symbol, u.wallet_address
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       WHERE l.uid = UNHEX(?) LIMIT 1`,
      [loanUid]
    );
    if (!loans || loans.length === 0) {
      return rtnRes(res, 404, 'Loan not found');
    }
    const loan = loans[0];

    // Verify user owns this loan
    if (loan.user_uid !== userUid) {
      return rtnRes(res, 403, 'Forbidden: This is not your loan');
    }

    // Fetch and decode the transaction receipt
    const { createPublicClient, http, fallback, parseAbi, decodeEventLog } = await import('viem');
    const { bsc, polygon } = await import('viem/chains');

    const REPAY_ABI = parseAbi([
      'event PrincipalRepaid(bytes32 indexed loanId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)'
    ]);

    const chainConfig = loan.network === 'bsc' ? bsc : polygon;
    const rpcUrlStr  = loan.network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
    const rpcUrls    = rpcUrlStr ? rpcUrlStr.split(',').map(u => u.trim()).filter(Boolean) : [];
    const transport  = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();
    const publicClient = createPublicClient({ chain: chainConfig, transport });

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt || receipt.status !== 'success') {
      return rtnRes(res, 400, 'Transaction not confirmed or reverted');
    }

    // Decode PrincipalRepaid event from logs
    let humanAmount = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: REPAY_ABI, data: log.data, topics: log.topics });
        if (decoded.eventName === 'PrincipalRepaid') {
          humanAmount = Number(decoded.args.amount) / 1e18;
          break;
        }
      } catch (_) { /* not our event */ }
    }

    if (humanAmount === null) {
      return rtnRes(res, 400, 'PrincipalRepaid event not found in transaction');
    }

    const principalBefore = Number(loan.outstanding_principal);
    const principalAfter  = Math.max(0, principalBefore - humanAmount);

    // Insert payment record and update loan atomically
    await queryRunner(
      `INSERT INTO loan_principal_payments
       (loan_uid, user_uid, payment_amount, principal_before, principal_after, tx_hash,
        wallet_address, token_symbol, network, payment_status, payment_source, confirmed_at)
       VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'user_initiated', NOW())`,
      [loanUid, userUid, humanAmount, principalBefore, principalAfter,
       txHash, loan.wallet_address, loan.token_symbol, loan.network]
    );

    await queryRunner(
      `UPDATE loans
       SET total_principal_paid   = total_principal_paid + ?,
           outstanding_principal  = GREATEST(0, outstanding_principal - ?),
           updated_at             = NOW()
       WHERE uid = UNHEX(?)`,
      [humanAmount, humanAmount, loanUid]
    );

    console.log(`✅ Repayment confirmed via API for loan ${loanUid}: ${humanAmount} tokens`);
    return rtnRes(res, 200, 'Principal repayment confirmed', { amountRepaid: humanAmount, principalAfter });
  } catch (err) {
    console.error('confirmRepayment error:', err);
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};

/**
 * POST /api/v1/loan/admin/loans/:loanUid/collect
 * Admin manually pulls an arbitrary amount from the user's wallet via collectPayment.
 * Dual-approach: submits on-chain tx, waits for receipt, updates DB immediately via resolveInterestCollection.
 */
export const adminManualCollect = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return rtnRes(res, 403, 'Forbidden: Admins only');

    const { loanUid } = req.params;
    const { amount } = req.body;

    if (!loanUid || !amount) return rtnRes(res, 400, 'loanUid and amount are required');
    const humanAmount = parseFloat(amount);
    if (isNaN(humanAmount) || humanAmount <= 0) return rtnRes(res, 400, 'amount must be a positive number');

    const loans = await queryRunner(
      `SELECT HEX(l.uid) as uid, HEX(l.loan_id) as loan_id, HEX(l.user_uid) as user_uid,
              l.principal_amount, l.outstanding_principal, l.interest_rate,
              l.token_address, l.token_symbol, l.network, u.wallet_address, l.status
       FROM loans l
       JOIN users u ON l.user_uid = u.uid
       WHERE l.uid = UNHEX(?) LIMIT 1`,
      [loanUid]
    );
    if (!loans || loans.length === 0) return rtnRes(res, 404, 'Loan not found');
    const loan = loans[0];

    if (!['approved', 'active', 'overdue'].includes(loan.status)) {
      return rtnRes(res, 400, `Cannot collect from a loan with status '${loan.status}'`);
    }

    const { getCollectorWalletClient, getSystemSettings, resolveInterestCollection } = await import('../services/loanService.js');
    const { createPublicClient, http, fallback, parseAbi, parseUnits, decodeEventLog } = await import('viem');
    const { bsc, polygon } = await import('viem/chains');

    const LOAN_ABI = parseAbi([
      'function collectPayment(bytes32 loanId, address user, address token, uint256 amount) external',
      'event PaymentCollected(bytes32 indexed loanId, address indexed user, address indexed token, uint256 amount, uint256 timestamp)',
      'event PaymentSkipped(bytes32 indexed loanId, address indexed user, address indexed token, uint256 timestamp)'
    ]);

    const LOAN_CONTRACT_ADDRESSES = {
      bsc:     process.env.BSC_LOAN_CONTRACT_ADDRESS || '',
      polygon: process.env.POLYGON_LOAN_CONTRACT_ADDRESS || '',
    };

    const contractAddress = LOAN_CONTRACT_ADDRESSES[loan.network];
    const walletClient    = getCollectorWalletClient(loan.network);
    if (!contractAddress || !walletClient) {
      return rtnRes(res, 503, `On-chain collection not configured for '${loan.network}'`);
    }

    const chainConfig  = loan.network === 'bsc' ? bsc : polygon;
    const rpcUrlStr    = loan.network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
    const rpcUrls      = rpcUrlStr ? rpcUrlStr.split(',').map(u => u.trim()).filter(Boolean) : [];
    const transport    = rpcUrls.length > 0 ? fallback(rpcUrls.map(u => http(u))) : http();
    const publicClient = createPublicClient({ chain: chainConfig, transport });

    const amountWei     = parseUnits(humanAmount.toFixed(18), 18);
    const loanIdBytes32 = loan.loan_id.startsWith('0x') ? loan.loan_id : `0x${loan.loan_id}`;
    const walletAddr    = loan.wallet_address.startsWith('0x') ? loan.wallet_address : `0x${loan.wallet_address}`;

    // Insert a manual ledger entry in 'collecting' state
    const now           = new Date();
    const frequencyDays = Number(await getSystemSettings('loan_interest_frequency_days')) || 30;
    const periodStart   = new Date(now.getTime() - frequencyDays * 24 * 60 * 60 * 1000);
    const ledgerResult  = await queryRunner(
      `INSERT INTO loan_interest_ledger
       (loan_uid, user_uid, interest_amount, interest_rate, principal_at_time,
        period_start, period_end, collection_status, wallet_address, token_symbol, network)
       VALUES (UNHEX(?), UNHEX(?), ?, ?, ?, ?, ?, 'collecting', ?, ?, ?)`,
      [loanUid, loan.user_uid, humanAmount, Number(loan.interest_rate),
       Number(loan.principal_amount), periodStart, now,
       loan.wallet_address, loan.token_symbol, loan.network]
    );
    const ledgerId = ledgerResult.insertId;

    // Submit on-chain tx
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: LOAN_ABI,
      functionName: 'collectPayment',
      args: [loanIdBytes32, walletAddr, loan.token_address, amountWei],
    });

    console.log(`⚡ [Admin Manual Collect] tx submitted: ${txHash} — waiting for receipt...`);

    // Immediately wait for receipt and resolve DB
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      let collectedAmount = 0;
      let eventName = null;

      if (receipt.status === 'success') {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({ abi: LOAN_ABI, data: log.data, topics: log.topics });
            if (decoded.eventName === 'PaymentCollected' || decoded.eventName === 'PaymentSkipped') {
              eventName = decoded.eventName;
              if (decoded.eventName === 'PaymentCollected') collectedAmount = Number(decoded.args.amount) / 1e18;
              break;
            }
          } catch (_) { /* skip non-matching logs */ }
        }

        if (eventName === 'PaymentCollected') {
          await resolveInterestCollection(ledgerId, 'collected', collectedAmount, txHash);
          return rtnRes(res, 200, 'Manual collection successful', { txHash, collectedAmount });
        } else if (eventName === 'PaymentSkipped') {
          await resolveInterestCollection(ledgerId, 'missed', 0, txHash);
          return rtnRes(res, 200, 'Skipped — insufficient user balance/allowance', { txHash, collectedAmount: 0 });
        }
      }
      await resolveInterestCollection(ledgerId, 'failed', 0, txHash);
      return rtnRes(res, 400, 'Transaction reverted on-chain', { txHash });
    } catch (receiptErr) {
      console.error('Receipt error:', receiptErr.message);
      // Leave in 'collecting' — listener will resolve it
      return rtnRes(res, 202, 'Transaction submitted; receipt timed out — listener will finalize', { txHash });
    }
  } catch (err) {
    console.error('adminManualCollect error:', err);
    return rtnRes(res, 500, 'Server Error', { error: err.message });
  }
};


