// Hook to fetch all properties owned by the current user from the blockchain
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useOwnerProperties } from './usePropertyToken';
import { PropertyData, formatPropertyValuation, getPropertyTokenAddress, PROPERTY_TOKEN_ABI } from '@/lib/propertyToken';
import { getIPFSUrl } from '@/lib/ipfs';
import { useEffect, useState } from 'react';

export interface PropertyMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface UserProperty {
  tokenId: string;
  title: string;
  address: string;
  value: string;
  tokenizedPortion: number;
  tokenizedValue: string;
  imageUrl: string;
  tokenized: boolean;
  collateralType: 'USDT' | 'Gold';
  propertyData: PropertyData;
  metadata?: PropertyMetadata;
}

/**
 * Helper function to check if chain is PolkaVM (requires authorizationList)
 */
function isPolkaVMChain(chainId: number): boolean {
  return chainId === 420420422; // Polkadot Hub TestNet
}

/**
 * Helper function to create contract read parameters with conditional authorizationList
 */
function createContractReadParams<T extends Record<string, any>>(
  chainId: number,
  params: T
): T {
  // Only add authorizationList for PolkaVM networks
  if (isPolkaVMChain(chainId)) {
    return { ...params, authorizationList: [] } as T;
  }
  return params;
}

/**
 * Hook to fetch all properties owned by the current user
 * Fetches blockchain data and IPFS metadata
 */
export function useUserProperties() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const { tokenIds: ownerPropertiesTokenIds, isLoading: isLoadingTokenIds, error: tokenIdsError, refetch: refetchTokenIds } = useOwnerProperties(address);
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      if (!address || !publicClient) {
        setProperties([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const contractAddress = getPropertyTokenAddress(chainId);
        
        if (!contractAddress) {
          throw new Error(`PropertyToken contract not configured for chain ${chainId}. Please switch to a supported network.`);
        }

        // Verify contract exists on this network by checking if it has code
        try {
          const code = await publicClient.getBytecode({ address: contractAddress as `0x${string}` });
          if (!code || code === '0x') {
            throw new Error(
              `PropertyToken contract not deployed on this network (Chain ID: ${chainId}). ` +
              `The contract address ${contractAddress} exists on Polkadot Hub TestNet (Chain ID: 420420422). ` +
              `Please switch to the correct network.`
            );
          }
        } catch (codeErr) {
          throw new Error(
            `Cannot verify contract on network (Chain ID: ${chainId}). ` +
            `Please ensure you're connected to Polkadot Hub TestNet (Chain ID: 420420422) where the contract is deployed.`
          );
        }

        // Get total supply to determine how many tokens exist
        let totalSupply = BigInt(0);
        try {
          const baseParams = {
            address: contractAddress as `0x${string}`,
            abi: PROPERTY_TOKEN_ABI,
            functionName: 'totalSupply' as const,
          };
          const readParams = createContractReadParams(chainId, baseParams);
          const supply = await publicClient.readContract(
            readParams as any
          ) as bigint;
          totalSupply = supply;
        } catch (err) {
          // If totalSupply fails, we'll still try to use getOwnerProperties or fallback
          console.warn('Failed to fetch total supply, will use alternative method:', err);
        }

        // Determine which token IDs to fetch
        let tokenIdsToFetch: bigint[] = [];

        // First, try using getOwnerProperties if it returns data
        if (ownerPropertiesTokenIds && ownerPropertiesTokenIds.length > 0) {
          tokenIdsToFetch = ownerPropertiesTokenIds;
        } else if (totalSupply > 0) {
          // Fallback: iterate through all tokens and check ownership
          console.log(`getOwnerProperties returned empty, using fallback method. Total supply: ${totalSupply}`);
          const ownedTokens: bigint[] = [];
          
          // Iterate through all token IDs (starting from 1)
          for (let i = 1; i <= Number(totalSupply); i++) {
            try {
              const baseParams = {
                address: contractAddress as `0x${string}`,
                abi: PROPERTY_TOKEN_ABI,
                functionName: 'ownerOf' as const,
                args: [BigInt(i)] as const,
              };
              const readParams = createContractReadParams(chainId, baseParams);
              const owner = await publicClient.readContract(
                readParams as any
              ) as `0x${string}`;
              
              // Compare addresses (case-insensitive)
              if (owner.toLowerCase() === address.toLowerCase()) {
                ownedTokens.push(BigInt(i));
              }
            } catch (err) {
              // Token doesn't exist or other error, skip it
              continue;
            }
          }
          
          tokenIdsToFetch = ownedTokens;
        }

        if (tokenIdsToFetch.length === 0) {
          setProperties([]);
          setIsLoading(false);
          return;
        }

        const propertyPromises = tokenIdsToFetch.map(async (tokenId) => {
          // Fetch property data from blockchain
          let propertyData: PropertyData | null = null;
          
          try {
            const baseParams = {
              address: contractAddress as `0x${string}`,
              abi: PROPERTY_TOKEN_ABI,
              functionName: 'getPropertyData' as const,
              args: [tokenId] as const,
            };
            const readParams = createContractReadParams(chainId, baseParams);
            const data = await publicClient.readContract(
              readParams as any
            ) as PropertyData;
            
            propertyData = data;
          } catch (err) {
            console.error(`Failed to fetch property data for token ${tokenId}:`, err);
            return null;
          }
          
          if (!propertyData) {
            return null;
          }

          // Fetch metadata from IPFS
          let metadata: PropertyMetadata | undefined;
          let imageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'; // Default image
          let title = `Property #${tokenId.toString()}`;
          let address = 'Address not available';

          try {
            if (propertyData.metadataURI) {
              const metadataUrl = getIPFSUrl(propertyData.metadataURI);
              const metadataResponse = await fetch(metadataUrl);
              
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
                
                // Extract title and address from metadata
                title = metadata.name || title;
                
                // Find address in attributes
                const addressAttr = metadata.attributes?.find(
                  (attr: any) => attr.trait_type === 'Address'
                );
                const cityAttr = metadata.attributes?.find(
                  (attr: any) => attr.trait_type === 'City'
                );
                const countryAttr = metadata.attributes?.find(
                  (attr: any) => attr.trait_type === 'Country'
                );
                
                if (addressAttr || cityAttr || countryAttr) {
                  const parts = [addressAttr?.value, cityAttr?.value, countryAttr?.value].filter(Boolean);
                  address = parts.join(', ') || address;
                }

                // Get image URL
                if (metadata.image) {
                  imageUrl = getIPFSUrl(metadata.image);
                }
              }
            }
          } catch (metadataError) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
            // Continue with default values
          }

          // Format values
          const valuation = formatPropertyValuation(propertyData.valuation);
          const tokenizedValue = formatPropertyValuation(propertyData.tokenizedValue);
          const tokenizedPortion = Number(propertyData.tokenizedPortion);

          return {
            tokenId: tokenId.toString(),
            title,
            address,
            value: valuation,
            tokenizedPortion,
            tokenizedValue,
            imageUrl,
            tokenized: true,
            collateralType: propertyData.collateralType as 'USDT' | 'Gold',
            propertyData,
            metadata,
          } as UserProperty;
        });

        const fetchedProperties = (await Promise.all(propertyPromises)).filter(
          (p): p is UserProperty => p !== null
        );

        setProperties(fetchedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProperties();
  }, [address, ownerPropertiesTokenIds, chainId, publicClient]);

  return {
    properties,
    isLoading: isLoading || isLoadingTokenIds,
    error: error || tokenIdsError,
    refetch: refetchTokenIds,
  };
}


