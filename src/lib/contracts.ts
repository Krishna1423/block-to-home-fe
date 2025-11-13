// Contract addresses and ABIs
// Update these with your actual contract addresses

// USDT Contract Addresses (ERC-20)
export const USDT_ADDRESSES = {
  // Mainnet
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet USDT
  // Polygon
  137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT
  // Sepolia (testnet)
  11155111: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // Sepolia testnet USDT (mock)
  // Polygon Amoy (testnet)
  80002: '0x1c4a1c73A6F0E8F0C5C4B7F0C5C4B7F0C5C4B7F0', // Polygon Amoy testnet USDT (mock)
} as const;

// USDT ABI (ERC-20 standard functions)
export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
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
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// Helper function to get USDT address for a chain
export const getUSDTAddress = (chainId: number): `0x${string}` | undefined => {
  return USDT_ADDRESSES[chainId as keyof typeof USDT_ADDRESSES] as `0x${string}` | undefined;
};

// Format USDT balance (USDT has 6 decimals)
export const formatUSDTBalance = (balance: bigint): string => {
  const decimals = 6; // USDT uses 6 decimals
  const divisor = BigInt(10 ** decimals);
  const wholePart = balance / divisor;
  const fractionalPart = balance % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toLocaleString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/\.?0+$/, '');
  
  return `${wholePart.toLocaleString()}.${trimmedFractional}`;
};

// Parse USDT amount to wei (6 decimals)
export const parseUSDTAmount = (amount: string): bigint => {
  const decimals = 6;
  const [whole, fractional = ''] = amount.split('.');
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fractionalPadded);
};

