// LoanEscrow Contract Configuration
// This file contains the ABI and contract addresses for the LoanEscrow contract

// LoanEscrow Contract ABI
export const LOAN_ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { internalType: 'uint256', name: 'propertyTokenId', type: 'uint256' },
      { internalType: 'address', name: 'borrower', type: 'address' },
    ],
    name: 'lockPropertyToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'releasePropertyToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_loanContract', type: 'address' }],
    name: 'setLoanContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'loanContract',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'liquidatePropertyToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'getEscrowData',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'loanId', type: 'uint256' },
          { internalType: 'uint256', name: 'propertyTokenId', type: 'uint256' },
          { internalType: 'address', name: 'borrower', type: 'address' },
          { internalType: 'address', name: 'lender', type: 'address' },
          { internalType: 'bool', name: 'isLocked', type: 'bool' },
          { internalType: 'uint256', name: 'lockedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'releasedAt', type: 'uint256' },
        ],
        internalType: 'struct LoanEscrow.EscrowData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// LoanEscrow Contract Addresses for different chains
export const LOAN_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
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

// Helper function to get LoanEscrow address for a chain
export const getLoanEscrowAddress = (chainId: number): `0x${string}` | undefined => {
  // First, check environment variables (for dynamic configuration)
  const envKey = `VITE_LOAN_ESCROW_CONTRACT_ADDRESS_${chainId}`;
  const envAddress = import.meta.env[envKey];
  
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  
  // Fallback to default addresses
  const address = LOAN_ESCROW_ADDRESSES[chainId];
  
  // Return undefined if address is zero address (not deployed)
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  
  return address;
};


