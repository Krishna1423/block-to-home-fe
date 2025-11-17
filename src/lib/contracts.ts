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
  // Polkadot Hub TestNet (PolkaVM)
  420420422: '0xe6004b1b76E6C385436154552b66Ed415a3dB272', // Polkadot Hub TestNet MockUSDT
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
  // First, check environment variable (for dynamic configuration)
  const envKey = `VITE_USDT_CONTRACT_ADDRESS_${chainId}`;
  const envAddress = import.meta.env[envKey];
  
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  
  // Fallback to default addresses
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

// PropertyToken Contract Addresses
export const PROPERTY_TOKEN_ADDRESSES = {
  // Add your deployed contract addresses here
  // Format: chainId: '0x...'
} as const;

// Helper function to get PropertyToken address for a chain
export const getPropertyTokenAddress = (chainId: number): `0x${string}` | undefined => {
  // Check environment variable first, then fallback to hardcoded addresses
  const envAddress = import.meta.env[`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_${chainId}`];
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  return PROPERTY_TOKEN_ADDRESSES[chainId as keyof typeof PROPERTY_TOKEN_ADDRESSES] as `0x${string}` | undefined;
};

// PropertyToken ABI (ERC-721 with custom functions)
export const PROPERTY_TOKEN_ABI = [
  // ERC-721 Standard Functions
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Custom PropertyToken Functions
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'valuation', type: 'uint256' },
      { internalType: 'uint256', name: 'tokenizedPortion', type: 'uint256' },
      { internalType: 'uint256', name: 'tokenizedValue', type: 'uint256' },
      { internalType: 'string', name: 'collateralType', type: 'string' },
      { internalType: 'string', name: 'tokenURI', type: 'string' },
    ],
    name: 'mintPropertyToken',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getPropertyData',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'uint256', name: 'valuation', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenizedPortion', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenizedValue', type: 'uint256' },
          { internalType: 'string', name: 'collateralType', type: 'string' },
          { internalType: 'string', name: 'metadataURI', type: 'string' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct PropertyToken.PropertyData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'getOwnerProperties',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'isPropertyActive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

