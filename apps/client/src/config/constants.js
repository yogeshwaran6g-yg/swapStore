export const USDT_ADDRESSES = {
  bnb: '0x55d398326f99059fF775485246999027B3197955',
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
};

export const USDC_ADDRESSES = {
  bnb: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  polygon: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
};

// export const USDS_ADDRESSES = {
//   bsc: 'NOT_VERIFIED',
//   polygon: 'NOT_VERIFIED',
// };

// export const USDE_ADDRESSES = {
//   polygon: 'NOT_VERIFIED',
//   bsc: 'NOT_VERIFIED',
// };


export const DAI_ADDRESSES = {
  bnb: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
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
];


// ── API Endpoints ──────────────────────────────────────────
export const endpoints = {
  AUTH: {
    walletLogin: '/api/v1/auth/walletLogin',
    profile: '/api/v1/auth/profile',
  },
  RATES: {
    list: '/api/v1/rates',
  },
  SWAP: {
    submit: '/api/v1/auth/swap-form',
  },
};