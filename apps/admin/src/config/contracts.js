export const CRYPTO_LOAN_ABI = [
  {
    name: 'setAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newAdmin', type: 'address' }],
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
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [],
  },
];

export const CONTRACT_ADDRESSES = {
  polygon: import.meta.env.VITE_LOAN_CONTRACT_POLYGON || '',
};

export const SWAP_ABI = [
  {
    name: 'setAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newAdmin', type: 'address' }],
    outputs: [],
  },
];

export const SWAP_CONTRACT_ADDRESSES = {
  polygon: import.meta.env.VITE_GATEWAY_POLYGON || import.meta.env.VITE_SWAP_CONTRACT_POLYGON || '0x75402765B77b32E66157E0E7814596d199F5E0b2',
};
