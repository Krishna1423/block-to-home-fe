// React hook for interacting with PropertyToken contract
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId, useConfig } from 'wagmi';
import { getPropertyTokenAddress, PROPERTY_TOKEN_ABI, PropertyData, parsePropertyValuation } from '@/lib/propertyToken';

interface MintPropertyTokenParams {
  to: `0x${string}`;
  valuation: string; // Property valuation in USD (will be converted to USDT with 6 decimals)
  tokenizedPortion: number; // Percentage (1-100)
  tokenizedValue: string; // Tokenized value in USD
  collateralType: 'USDT' | 'Gold';
  tokenURI: string; // IPFS hash or URI
}

/**
 * Hook for minting property tokens
 */
export function useMintPropertyToken() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintPropertyToken = async (params: MintPropertyTokenParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getPropertyTokenAddress(chainId);
    if (!contractAddress) {
      throw new Error(`PropertyToken contract not deployed on chain ${chainId}`);
    }

    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not configured`);
    }

    // Convert valuation and tokenizedValue to USDT format (6 decimals)
    const valuation = parsePropertyValuation(params.valuation);
    const tokenizedValue = parsePropertyValuation(params.tokenizedValue);

    try {
      writeContract({
        address: contractAddress,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'mintPropertyToken',
        args: [
          params.to,
          valuation,
          BigInt(params.tokenizedPortion),
          tokenizedValue,
          params.collateralType,
          params.tokenURI,
        ],
        chain,
        account: address,
      });
    } catch (err) {
      console.error('Error minting property token:', err);
      throw err;
    }
  };

  return {
    mintPropertyToken,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isPending || isConfirming,
    error,
  };
}

/**
 * Hook for reading property data
 */
export function usePropertyData(tokenId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getPropertyData',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId && !!contractAddress,
    },
  });

  return {
    propertyData: data as PropertyData | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting owner's properties
 */
export function useOwnerProperties(ownerAddress: `0x${string}` | undefined) {
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getOwnerProperties',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && !!contractAddress,
    },
  });

  return {
    tokenIds: data as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for getting total supply
 */
export function useTotalSupply() {
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress,
    },
  });

  return {
    totalSupply: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for checking if property is active
 */
export function useIsPropertyActive(tokenId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'isPropertyActive',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId && !!contractAddress,
    },
  });

  return {
    isActive: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for updating property metadata
 */
export function useUpdatePropertyMetadata() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const updateMetadata = async (tokenId: bigint, newTokenURI: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getPropertyTokenAddress(chainId);
    if (!contractAddress) {
      throw new Error(`PropertyToken contract not deployed on chain ${chainId}`);
    }

    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not configured`);
    }

    try {
      writeContract({
        address: contractAddress,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'updatePropertyMetadata',
        args: [tokenId, newTokenURI],
        chain,
        account: address,
      });
    } catch (err) {
      console.error('Error updating property metadata:', err);
      throw err;
    }
  };

  return {
    updateMetadata,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isPending || isConfirming,
    error,
  };
}

