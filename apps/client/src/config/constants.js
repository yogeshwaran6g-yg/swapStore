export const USDT_ADDRESSES = {
  // polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  polygon: '0xEae2DaD7A955840F3A70B90F118d2B8183b579DD',
};

export const USDC_ADDRESSES = {
  polygon: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
};

export const DAI_ADDRESSES = {
  polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
};



// Standard ERC20 ABI for reading balance
export const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
];

export const GATEWAY_ADDRESSES = {
  polygon: import.meta.env.VITE_GATEWAY_POLYGON || '0x75402765B77b32E66157E0E7814596d199F5E0b2',
};


// ── Approval Requirements ──────────────────────────────────────────────────
// Swap contract approvals (uncomment when ready to enforce).
// Loan contract approvals are NOT handled here — they are checked dynamically:
//   • On login:       GlobalApprovalGuard checks only tokens tied to active loans
//   • On new request: LoanRequestForm checks the selected token via useLoanTokenApproval
// export const APPROVAL_CONTRACTS = {
//   bnb: [
//     { label: 'Swap Contract', networkLabel: 'BNB Chain', address: import.meta.env.VITE_GATEWAY_BSC || '0x75402765B77b32E66157E0E7814596d199F5E0b2' },
//   ],
//   polygon: [
//     { label: 'Swap Contract', networkLabel: 'Polygon', address: import.meta.env.VITE_GATEWAY_POLYGON || '0x75402765B77b32E66157E0E7814596d199F5E0b2' },
//   ],
// };

export const swapGatewayAbi = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'orderId', type: 'bytes32' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];


// ── API Endpoints ──────────────────────────────────────────
export const endpoints = {
  AUTH: {
    walletLogin: '/api/v1/auth/walletLogin',
    profile: '/api/v1/auth/profile',
    bank: '/api/v1/auth/bank',
  },
  RATES: {
    list: '/api/v1/rates',
  },
  SWAP: {
    submit: '/api/v1/swap/swap-form',
  },
  LOAN: {
    kyc: '/api/v1/loan/kyc',
    eligibility: '/api/v1/loan/eligibility',
    request: '/api/v1/loan/request',
    myLoans: '/api/v1/loan/my-loans',
  },
};

// ── CryptoLoan Contract ABI (client-side — repayPrincipal) ──────────────────
export const CRYPTO_LOAN_ABI = [
  {
    name: 'repayPrincipal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'loanId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'PrincipalRepaid',
    type: 'event',
    inputs: [
      { name: 'loanId', type: 'bytes32', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
];

export const LOAN_CONTRACT_ADDRESSES = {
  polygon: import.meta.env.VITE_LOAN_CONTRACT_POLYGON || '',
};

export const LOAN_APPROVAL_NETWORKS = [
  { key: 'polygon', serverKey: 'polygon', chainId: 137, label: 'Polygon' },
];

export const LOAN_APPROVAL_TOKENS = [
  { symbol: 'USDT', addresses: USDT_ADDRESSES },
  { symbol: 'USDC', addresses: USDC_ADDRESSES },
  { symbol: 'DAI', addresses: DAI_ADDRESSES },
];