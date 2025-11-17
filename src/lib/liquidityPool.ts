// LiquidityPool Contract Configuration
// This file contains the ABI and contract addresses for the LiquidityPool contract

// LiquidityPool Contract ABI (key functions)
export const LIQUIDITY_POOL_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalPoolBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLoansFunded',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'investor', type: 'address' }],
    name: 'getParticipant',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'investor', type: 'address' },
          { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'shareTokens', type: 'uint256' },
          { internalType: 'uint256', name: 'totalDeposited', type: 'uint256' },
          { internalType: 'uint256', name: 'totalWithdrawn', type: 'uint256' },
          { internalType: 'uint256', name: 'lastDepositAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct LiquidityPool.PoolParticipant',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minDepositAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalReturnsReceived',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalShareTokens',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// LiquidityPool Contract Addresses for different chains
export const LIQUIDITY_POOL_ADDRESSES: Record<number, `0x${string}`> = {
  // Mainnet
  1: '0x0000000000000000000000000000000000000000',
  // Polygon
  137: '0x0000000000000000000000000000000000000000',
  // Sepolia (testnet)
  11155111: '0x0000000000000000000000000000000000000000',
  // Polygon Amoy (testnet)
  80002: '0x0000000000000000000000000000000000000000',
  // Polkadot Hub TestNet (PolkaVM)
  420420422: '0x0000000000000000000000000000000000000000',
};

// Helper function to get LiquidityPool address for a chain
export const getLiquidityPoolAddress = (chainId: number): `0x${string}` | undefined => {
  // First, check environment variables (for dynamic configuration)
  const envKey = `VITE_LIQUIDITY_POOL_CONTRACT_ADDRESS_${chainId}`;
  const envAddress = import.meta.env[envKey];
  
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  
  // Fallback to default addresses
  const address = LIQUIDITY_POOL_ADDRESSES[chainId];
  
  // Return undefined if address is zero address (not deployed)
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  
  return address;
};


