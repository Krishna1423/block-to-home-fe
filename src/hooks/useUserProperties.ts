import { useReadContract, useReadContracts } from 'wagmi';
import { getPropertyTokenAddress, PROPERTY_TOKEN_ABI } from '@/lib/contracts';
import { useAccount, useChainId } from 'wagmi';
import { useMemo, useState, useEffect } from 'react';
import { fetchMetadataFromIPFS, getIPFSUrl } from '@/lib/ipfs';

export interface PropertyData {
  tokenId: bigint;
  owner: `0x${string}`;
  valuation: bigint;
  tokenizedPortion: bigint;
  tokenizedValue: bigint;
  collateralType: string;
  metadataURI: string;
  createdAt: bigint;
  isActive: boolean;
}

export interface Property {
  tokenId: string;
  owner: string;
  valuation: number; // In USDT (6 decimals)
  tokenizedPortion: number; // Percentage
  tokenizedValue: number; // In USDT (6 decimals)
  collateralType: string;
  metadataURI: string;
  createdAt: number;
  isActive: boolean;
  imageUrl?: string;
  title?: string;
  address?: string;
}

/**
 * Hook to get user's tokenized properties from PropertyToken contract
 */
export const useUserProperties = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const propertyTokenAddress = getPropertyTokenAddress(chainId);

  // Get list of token IDs owned by user
  const { data: tokenIds, isLoading: isLoadingTokenIds, error: tokenIdsError, refetch: refetchTokenIds } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'getOwnerProperties',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!propertyTokenAddress,
      refetchInterval: false, // Don't auto-refetch
    },
  });

  // Also check balance as a fallback
  const { data: balance } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!propertyTokenAddress,
    },
  });

  // Fallback: If balance > 0 but getOwnerProperties returns empty, try to find tokens manually
  const { data: totalSupply } = useReadContract({
    address: propertyTokenAddress,
    abi: PROPERTY_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!propertyTokenAddress && (balance ? Number(balance) > 0 : false) && (!tokenIds || tokenIds.length === 0),
    },
  });

  // If we have balance but no tokenIds, try checking tokens manually
  const fallbackTokenIds = useMemo(() => {
    if (tokenIds && tokenIds.length > 0) return []; // Don't use fallback if we have tokenIds
    if (!balance || Number(balance) === 0) return [];
    if (!totalSupply || Number(totalSupply) === 0) return [];
    
    const supply = Number(totalSupply);
    // Check up to 50 tokens (adjust if you have more)
    const maxTokensToCheck = Math.min(supply, 50);
    return Array.from({ length: maxTokensToCheck }, (_, i) => BigInt(i + 1));
  }, [tokenIds, balance, totalSupply]);

  // Check ownership of fallback tokens
  const fallbackContracts = useMemo(() => {
    if (!propertyTokenAddress || fallbackTokenIds.length === 0) return [];
    return fallbackTokenIds.map((tokenId) => ({
      address: propertyTokenAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'ownerOf' as const,
      args: [tokenId] as [bigint],
    }));
  }, [fallbackTokenIds, propertyTokenAddress]);

  // Use type assertion to avoid deep type instantiation error
  // @ts-ignore - Type instantiation is excessively deep, using any to bypass
  const fallbackOwnershipChecks = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: fallbackContracts as any,
    query: {
      enabled: fallbackContracts.length > 0 && !!address,
    },
  });

  // Find which fallback tokens belong to the user
  const fallbackUserTokens = useMemo(() => {
    if (!fallbackOwnershipChecks.data || !address || fallbackTokenIds.length === 0) return [];
    return fallbackOwnershipChecks.data
      .map((result, index) => {
        if (result.status === 'success' && result.result && result.result.toLowerCase() === address.toLowerCase()) {
          return fallbackTokenIds[index];
        }
        return null;
      })
      .filter((tokenId): tokenId is bigint => tokenId !== null);
  }, [fallbackOwnershipChecks.data, address, fallbackTokenIds]);

  // Use fallback tokens if getOwnerProperties returned empty but we found tokens via ownerOf
  const finalTokenIds = useMemo(() => {
    if (tokenIds && tokenIds.length > 0) return tokenIds;
    if (fallbackUserTokens.length > 0) {
      console.log('Using fallback method - found tokens via ownerOf:', fallbackUserTokens);
      return fallbackUserTokens;
    }
    return [];
  }, [tokenIds, fallbackUserTokens]);

  // Fetch property data for each token ID
  const contracts = useMemo(() => {
    if (!finalTokenIds || finalTokenIds.length === 0 || !propertyTokenAddress) return [];
    
    return finalTokenIds.map((tokenId) => ({
      address: propertyTokenAddress,
      abi: PROPERTY_TOKEN_ABI,
      functionName: 'getPropertyData' as const,
      args: [tokenId],
    }));
  }, [finalTokenIds, propertyTokenAddress]);

  const { data: propertiesData, isLoading: isLoadingProperties } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  // Transform property data (without metadata first)
  const baseProperties: Property[] = useMemo(() => {
    if (!propertiesData || !finalTokenIds || finalTokenIds.length === 0) return [];

    return propertiesData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null;
        
        const data = result.result as PropertyData;
        const tokenId = finalTokenIds[index];

        // Convert bigint values to numbers (USDT has 6 decimals)
        const valuation = Number(data.valuation) / 1e6;
        const tokenizedValue = Number(data.tokenizedValue) / 1e6;
        const tokenizedPortion = Number(data.tokenizedPortion);
        const createdAt = Number(data.createdAt);

        // Default values (will be updated when metadata is fetched)
        const property: Property = {
          tokenId: tokenId.toString(),
          owner: String(data.owner),
          valuation,
          tokenizedPortion,
          tokenizedValue,
          collateralType: data.collateralType,
          metadataURI: data.metadataURI,
          createdAt,
          isActive: data.isActive,
          imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
          title: `Property #${tokenId.toString()}`,
          address: 'Address not available',
        };
        return property;
      })
      .filter((p): p is Property => p !== null && p !== undefined);
  }, [propertiesData, finalTokenIds]);

  // Fetch metadata from IPFS for all properties
  const [propertiesWithMetadata, setPropertiesWithMetadata] = useState<Property[]>(baseProperties);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  useEffect(() => {
    if (baseProperties.length === 0) {
      setPropertiesWithMetadata([]);
      setIsLoadingMetadata(false);
      return;
    }

    // Fetch metadata for each property
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const updatedProperties = await Promise.all(
          baseProperties.map(async (property) => {
            if (!property.metadataURI) return property;

            try {
              // Extract IPFS hash from metadataURI
              const ipfsHash = property.metadataURI
                .replace(/^ipfs:\/\//, '')
                .replace(/^https:\/\/ipfs\.io\/ipfs\//, '')
                .replace(/^https:\/\/gateway\.pinata\.cloud\/ipfs\//, '');

              if (!ipfsHash || ipfsHash === property.metadataURI) {
                return property; // Not a valid IPFS hash
              }

              // Fetch metadata from IPFS
              const metadata = await fetchMetadataFromIPFS<{
                name?: string;
                description?: string;
                image?: string;
                attributes?: Array<{ trait_type: string; value: string | number }>;
              }>(ipfsHash);

              // Extract property details from metadata
              const addressAttr = metadata.attributes?.find((attr) => attr.trait_type === 'Address');
              const cityAttr = metadata.attributes?.find((attr) => attr.trait_type === 'City');
              const countryAttr = metadata.attributes?.find((attr) => attr.trait_type === 'Country');

              // Build full address
              const addressParts = [
                addressAttr?.value,
                cityAttr?.value,
                countryAttr?.value,
              ].filter(Boolean);
              const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';

              // Get image URL
              let imageUrl = property.imageUrl;
              if (metadata.image) {
                const imageHash = metadata.image.replace(/^ipfs:\/\//, '');
                imageUrl = getIPFSUrl(imageHash);
              }

              // Get title from name or use default
              const title = metadata.name || property.title;

              return {
                ...property,
                title,
                address: fullAddress,
                imageUrl,
              };
            } catch (error) {
              console.error(`Failed to fetch metadata for property ${property.tokenId}:`, error);
              return property; // Return original property if metadata fetch fails
            }
          })
        );

        setPropertiesWithMetadata(updatedProperties);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [baseProperties]);

  const properties = propertiesWithMetadata;

  const isLoading = isLoadingTokenIds || isLoadingProperties || isLoadingMetadata;
  const error = tokenIdsError;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Property Fetch Debug ===');
    console.log('Property token address:', propertyTokenAddress);
    console.log('Is connected:', isConnected);
    console.log('Address:', address);
    console.log('Balance:', balance ? Number(balance) : 'N/A');
    console.log('Token IDs from getOwnerProperties:', tokenIds);
    console.log('Token IDs length:', tokenIds?.length || 0);
    console.log('Final token IDs (after fallback):', finalTokenIds);
    console.log('Fallback user tokens:', fallbackUserTokens);
    console.log('Total supply:', totalSupply ? Number(totalSupply) : 'N/A');
    if (propertiesData) {
      console.log('Properties data:', propertiesData);
      console.log('Properties:', properties);
    }
    if (tokenIdsError) {
      console.error('Error fetching token IDs:', tokenIdsError);
      console.error('Error details:', JSON.stringify(tokenIdsError, null, 2));
    }
    console.log('========================');
  }

  return {
    properties,
    isLoading,
    error,
    hasProperties: properties.length > 0,
    propertyTokenAddress, // Expose for debugging
    refetch: refetchTokenIds, // Allow manual refetch
    tokenIds: finalTokenIds, // Expose final token IDs (may include fallback)
    balance: balance ? Number(balance) : 0, // Expose balance for debugging
    usedFallback: fallbackUserTokens.length > 0 && (!tokenIds || tokenIds.length === 0), // Indicate if fallback was used
  };
};
