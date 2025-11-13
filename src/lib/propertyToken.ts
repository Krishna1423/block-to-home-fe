// PropertyToken Contract Configuration
// This file contains the ABI and contract addresses for the PropertyToken contract

// PropertyToken Contract ABI (ERC-721 + custom functions)
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
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'string', name: 'newTokenURI', type: 'string' },
    ],
    name: 'updatePropertyMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'valuation', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'tokenizedValue', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'collateralType', type: 'string' },
      { indexed: false, internalType: 'string', name: 'metadataURI', type: 'string' },
    ],
    name: 'PropertyTokenized',
    type: 'event',
  },
] as const;

// PropertyToken Contract Addresses for different chains
// Update these after deploying the contract to each chain
export const PROPERTY_TOKEN_ADDRESSES: Record<number, `0x${string}`> = {
  // Mainnet
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet - NOT DEPLOYED YET
  // Polygon
  137: '0x0000000000000000000000000000000000000000', // Polygon - NOT DEPLOYED YET
  // Sepolia (testnet)
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia - NOT DEPLOYED YET
  // Polygon Amoy (testnet)
  80002: '0x0000000000000000000000000000000000000000', // Polygon Amoy - NOT DEPLOYED YET
  // Polkadot Hub TestNet (PolkaVM)
  420420422: '0xb6A3e493e6162D9EcF9487162082f1f9EDdf0Bf9', // Polkadot Hub TestNet - DEPLOYED ✅
};

// Helper function to get PropertyToken address for a chain
export const getPropertyTokenAddress = (chainId: number): `0x${string}` | undefined => {
  // First, check environment variables (for dynamic configuration)
  const envKey = `VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_${chainId}`;
  const envAddress = import.meta.env[envKey];
  
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  
  // Fallback to default addresses
  const address = PROPERTY_TOKEN_ADDRESSES[chainId];
  
  // Return undefined if address is zero address (not deployed)
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  
  return address;
};

// Property Data Type (matches smart contract struct)
export interface PropertyData {
  tokenId: bigint;
  owner: `0x${string}`;
  valuation: bigint; // in USDT (6 decimals)
  tokenizedPortion: bigint; // percentage (1-100)
  tokenizedValue: bigint; // in USDT (6 decimals)
  collateralType: string;
  metadataURI: string;
  createdAt: bigint;
  isActive: boolean;
}

// Format property valuation (USDT has 6 decimals)
export const formatPropertyValuation = (valuation: bigint): string => {
  const decimals = 6; // USDT uses 6 decimals
  const divisor = BigInt(10 ** decimals);
  const wholePart = valuation / divisor;
  const fractionalPart = valuation % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/\.?0+$/, '');
  
  return `${wholePart.toString()}.${trimmedFractional}`;
};

// Parse property valuation to wei (6 decimals)
export const parsePropertyValuation = (amount: string): bigint => {
  const decimals = 6;
  const [whole, fractional = ''] = amount.split('.');
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fractionalPadded);
};

