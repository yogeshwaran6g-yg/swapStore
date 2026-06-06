// USDT Contract Addresses
export const USDT_ADDRESSES = {
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  bsc: '0x55d398326f99059fF775485246999027B3197955', // BNB Smart Chain
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
