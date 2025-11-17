import { useReadContract, useReadContracts } from 'wagmi';
import { getPropertyTokenAddress, PROPERTY_TOKEN_ABI } from '@/lib/contracts';
import { useAccount, useChainId } from 'wagmi';
import { useMemo } from 'react';

/**
 * Diagnostic hook to help debug property fetching issues
 */
export const usePropertyDiagnostics = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const propertyTokenAddress = getPropertyTokenAddress(chainId);

  // Check total supply
  const { data: totalSupply } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!propertyTokenAddress,
    },
  });

  // Check balance of user
  const { data: balance } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!propertyTokenAddress && !!address,
    },
  });

  // Try to get owner properties
  const { data: ownerProperties, error: ownerPropertiesError } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getOwnerProperties',
    args: address ? [address] : undefined,
    query: {
      enabled: !!propertyTokenAddress && !!address,
    },
  });

  // If we have a balance but no ownerProperties, try checking individual tokens
  // This is a fallback method - check tokens 1 through totalSupply
  const tokenIdsToCheck = useMemo(() => {
    if (!totalSupply || !balance || Number(balance) === 0) return [];
    const supply = Number(totalSupply);
    // Check first 10 tokens as a sample (adjust if needed)
    return Array.from({ length: Math.min(supply, 10) }, (_, i) => BigInt(i + 1));
  }, [totalSupply, balance]);

  // Check ownership of sample tokens
  const ownershipChecks = useReadContracts({
    contracts: tokenIdsToCheck.map((tokenId) => ({
      address: propertyTokenAddress!,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'ownerOf' as const,
      args: [tokenId],
    })),
    query: {
      enabled: tokenIdsToCheck.length > 0 && !!propertyTokenAddress && !!address,
    },
  });

  // Find which tokens belong to the user
  const userTokens = useMemo(() => {
    if (!ownershipChecks.data || !address) return [];
    return ownershipChecks.data
      .map((result, index) => {
        if (result.data && result.data.toLowerCase() === address.toLowerCase()) {
          return tokenIdsToCheck[index];
        }
        return null;
      })
      .filter((tokenId): tokenId is bigint => tokenId !== null);
  }, [ownershipChecks.data, address, tokenIdsToCheck]);

  return {
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    balance: balance ? Number(balance) : 0,
    ownerProperties: ownerProperties as bigint[] | undefined,
    ownerPropertiesError,
    userTokens,
    propertyTokenAddress,
    address,
    chainId,
    isConnected,
  };
};

