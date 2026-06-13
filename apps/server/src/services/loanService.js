import { v4 as uuidv4 } from 'uuid';
import { queryRunner } from '../config/db.js';
import { returnServiceResponse } from '../utils/responseUtils.js';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc, polygon } from 'viem/chains';

const CONTRACT_ADDRESSES = {
  bsc: process.env.BSC_CONTRACT_ADDRESS || '0xE6c3d9faeB15e97EA8d12434B638b11e17eB3425',
  polygon: process.env.POLYGON_CONTRACT_ADDRESS || '0x901e857B3d9EB2B180970A1105330EF43F4a9eF2',
};

const ERC20_ABI = [
  parseAbiItem('function balanceOf(address owner) view returns (uint256)'),
  parseAbiItem('function decimals() view returns (uint8)')
];

/**
 * Gets on-chain balance of a token for a user.
 */
export const getTokenBalance = async (walletAddress, tokenAddress, network) => {
  try {
    const chainConfig = network === 'bsc' ? bsc : polygon;
    const rpcUrl = network === 'bsc' ? process.env.BSC_RPC_URL : process.env.POLYGON_RPC_URL;
    
    if (!rpcUrl) return 0;
    
    const publicClient = createPublicClient({
      chain: chainConfig,
      transport: http(rpcUrl),
    });

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress]
    });
    
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });

    // convert to readable number
    return Number(balance) / (10 ** decimals);
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    return 0; // default to 0 on failure
  }
}

export const getSystemSettings = async (key) => {
  try {
    const rows = await queryRunner(`SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1`, [key]);
    if (rows && rows.length > 0) return rows[0].setting_value;
    return null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

export const uploadKyc = async (userUid, fileUrl, documentType) => {
  try {
    const result = await queryRunner(
      `INSERT INTO kyc_documents (user_uid, document_type, document_url, status) VALUES (UNHEX(?), ?, ?, 'pending')`,
      [userUid, documentType, fileUrl]
    );

    if (result && result.affectedRows > 0) {
      // Also update users table kyc_status to submitted
      await queryRunner(`UPDATE users SET kyc_status = 'submitted' WHERE uid = UNHEX(?)`, [userUid]);
      return returnServiceResponse(true);
    }
    return returnServiceResponse(false, null, 'Failed to save KYC document');
  } catch (error) {
    return returnServiceResponse(false, null, error.message);
  }
};

export const requestLoan = async (userUid, principalAmount, walletAddress, tokenAddress, network) => {
  try {
    // 1. Verify KYC
    const kycCheck = await queryRunner(`SELECT kyc_status FROM users WHERE uid = UNHEX(?) LIMIT 1`, [userUid]);
    if (!kycCheck || kycCheck.length === 0 || kycCheck[0].kyc_status !== 'approved') {
      return returnServiceResponse(false, null, 'KYC must be approved to request a loan');
    }

    // 2. Check token balance (must be > 100 or some defined amount)
    const balance = await getTokenBalance(walletAddress, tokenAddress, network);
    if (balance < 100) {
      return returnServiceResponse(false, null, 'Insufficient on-chain token balance to request loan. Minimum 100 required.');
    }

    // 3. Create loan
    const loanIdStr = uuidv4();
    const hexLoanId = loanIdStr.replace(/-/g, '');
    const loanIdBytes32 = '0x' + hexLoanId + '00000000000000000000000000000000';
    const interestRate = await getSystemSettings('loan_interest_rate') || 5.0; // default 5%
    
    const insertResult = await queryRunner(
      `INSERT INTO loans (uid, user_uid, loan_id, principal_amount, interest_rate, status) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, 'pending')`,
      [uuidv4().replace(/-/g, ''), userUid, hexLoanId, principalAmount, interestRate]
    );

    if (insertResult && insertResult.affectedRows > 0) {
      return returnServiceResponse(true, { loanId: loanIdBytes32 });
    }
    return returnServiceResponse(false, null, 'Failed to request loan');
  } catch (error) {
    console.error('Error in requestLoan:', error);
    return returnServiceResponse(false, null, error.message);
  }
};

export const getMyLoans = async (userUid) => {
  try {
    const loans = await queryRunner(
      `SELECT HEX(uid) as uid, HEX(loan_id) as loan_id, principal_amount, interest_rate, status, next_debit_date, created_at 
       FROM loans WHERE user_uid = UNHEX(?) ORDER BY created_at DESC`,
      [userUid]
    );
    return returnServiceResponse(true, { loans });
  } catch (error) {
    return returnServiceResponse(false, null, error.message);
  }
};
