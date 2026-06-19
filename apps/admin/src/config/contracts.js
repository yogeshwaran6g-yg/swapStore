// ── CryptoLoanSettlement v2 ABI ─────────────────────────────────────────────
export const CRYPTO_LOAN_ABI = [
  // ── Write Functions ──────────────────────────────────────────────────────
  {
    name: 'issueLoan',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'loanId',    type: 'bytes32' },
      { name: 'user',      type: 'address' },
      { name: 'token',     type: 'address' },
      { name: 'principal', type: 'uint256' },
      { name: 'fee',       type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'collectPayment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'loanId', type: 'bytes32' },
      { name: 'user',   type: 'address' },
      { name: 'token',  type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'repayPrincipal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'loanId', type: 'bytes32' },
      { name: 'token',  type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'closeLoan',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'loanId', type: 'bytes32' },
      { name: 'user',   type: 'address' },
      { name: 'reason', type: 'uint8'   },
    ],
    outputs: [],
  },
  // ── Admin / Owner Functions ──────────────────────────────────────────────
  {
    name: 'addToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  {
    name: 'removeToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateLoanWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateInterestWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateFeeWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'setAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newAdmin', type: 'address' }],
    outputs: [],
  },
  { name: 'pause',   type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'unpause', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  {
    name: 'emergencyWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  // ── View Functions ───────────────────────────────────────────────────────
  {
    name: 'getConfig',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'owner_',          type: 'address' },
      { name: 'admin_',          type: 'address' },
      { name: 'loanWallet_',     type: 'address' },
      { name: 'interestWallet_', type: 'address' },
      { name: 'feeWallet_',      type: 'address' },
      { name: 'paused_',         type: 'bool'    },
    ],
  },
  {
    name: 'getAcceptedTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
  // ── Events ───────────────────────────────────────────────────────────────
  {
    name: 'LoanIssued',
    type: 'event',
    inputs: [
      { name: 'loanId',    type: 'bytes32', indexed: true  },
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'token',     type: 'address', indexed: true  },
      { name: 'principal', type: 'uint256', indexed: false },
      { name: 'fee',       type: 'uint256', indexed: false },
      { name: 'netAmount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'PaymentCollected',
    type: 'event',
    inputs: [
      { name: 'loanId',    type: 'bytes32', indexed: true  },
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'token',     type: 'address', indexed: true  },
      { name: 'amount',    type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'PrincipalRepaid',
    type: 'event',
    inputs: [
      { name: 'loanId',    type: 'bytes32', indexed: true  },
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'token',     type: 'address', indexed: true  },
      { name: 'amount',    type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'LoanClosed',
    type: 'event',
    inputs: [
      { name: 'loanId',    type: 'bytes32', indexed: true  },
      { name: 'user',      type: 'address', indexed: true  },
      { name: 'reason',    type: 'uint8',   indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
];

export const CONTRACT_ADDRESSES = {
  bsc:     import.meta.env.VITE_LOAN_CONTRACT_BSC     || '0xfaa09C346475BaB145151d5DAF2c4f452Dc66a59',
  polygon: import.meta.env.VITE_LOAN_CONTRACT_POLYGON || '0x0000000000000000000000000000000000000000',
};

// ── Swap Contract ABI (Placeholder) ───────────────────────────────────────
export const SWAP_ABI = [
  // Example functions (update with actual Swap ABI once available)
  {
    name: 'setAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newAdmin', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateFeeWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'updateTreasuryWallet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newWallet', type: 'address' }],
    outputs: [],
  },
  {
    name: 'getConfig',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'admin_', type: 'address' },
      { name: 'feeWallet_', type: 'address' },
      { name: 'treasuryWallet_', type: 'address' },
    ],
  },
];

export const SWAP_CONTRACT_ADDRESSES = {
  bsc:     import.meta.env.VITE_SWAP_CONTRACT_BSC     || '0x0000000000000000000000000000000000000000',
  polygon: import.meta.env.VITE_SWAP_CONTRACT_POLYGON || '0x0000000000000000000000000000000000000000',
};
