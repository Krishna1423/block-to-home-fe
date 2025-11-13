// Custom hook for tokenizing properties (handles IPFS upload + blockchain minting)
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMintPropertyToken } from './usePropertyToken';
import {
  uploadToIPFS,
  uploadPropertyMetadataToIPFS,
  getIPFSUrl,
} from '@/lib/ipfs';

interface TokenizePropertyParams {
  address: string;
  city: string;
  country: string;
  valuation: string;
  tokenizedPortion: string;
  tokenizedValue: string;
  collateralType: 'USDT' | 'Gold';
  propertyImage: File | null;
  deed: File | null;
}

interface TokenizationStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

export function useTokenizeProperty() {
  const { address } = useAccount();
  const { mintPropertyToken, hash, isPending, isConfirming, isConfirmed, error } = useMintPropertyToken();
  const [steps, setSteps] = useState<TokenizationStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStep = (stepName: string, status: TokenizationStep['status'], message?: string) => {
    setSteps((prev) => {
      const existing = prev.find((s) => s.step === stepName);
      if (existing) {
        return prev.map((s) => (s.step === stepName ? { ...s, status, message } : s));
      }
      return [...prev, { step: stepName, status, message }];
    });
  };

  const tokenizeProperty = async (params: TokenizePropertyParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setSteps([]);

    try {
      // Step 1: Upload property image to IPFS
      updateStep('uploadImage', 'processing', 'Uploading property image to IPFS...');
      let imageHash = '';
      if (params.propertyImage) {
        try {
          imageHash = await uploadToIPFS(params.propertyImage);
          updateStep('uploadImage', 'completed', `Image uploaded: ${imageHash}`);
        } catch (error) {
          updateStep('uploadImage', 'error', `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }

      // Step 2: Upload property deed to IPFS
      updateStep('uploadDeed', 'processing', 'Uploading property deed to IPFS...');
      let deedHash = '';
      if (params.deed) {
        try {
          deedHash = await uploadToIPFS(params.deed);
          updateStep('uploadDeed', 'completed', `Deed uploaded: ${deedHash}`);
        } catch (error) {
          updateStep('uploadDeed', 'error', `Failed to upload deed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }

      // Step 3: Create property metadata
      updateStep('createMetadata', 'processing', 'Creating property metadata...');
      const propertyName = `Property at ${params.address}, ${params.city}, ${params.country}`;
      const propertyDescription = `Tokenized property located at ${params.address}, ${params.city}, ${params.country}. Valuation: $${parseInt(params.valuation).toLocaleString()}, Tokenized: ${params.tokenizedPortion}% ($${parseInt(params.tokenizedValue).toLocaleString()}). Collateral: ${params.collateralType}.`;

      const metadata = {
        name: propertyName,
        description: propertyDescription,
        image: imageHash ? `ipfs://${imageHash}` : '',
        attributes: [
          { trait_type: 'Address', value: params.address },
          { trait_type: 'City', value: params.city },
          { trait_type: 'Country', value: params.country },
          { trait_type: 'Valuation (USD)', value: parseInt(params.valuation) },
          { trait_type: 'Tokenized Portion (%)', value: parseInt(params.tokenizedPortion) },
          { trait_type: 'Tokenized Value (USD)', value: parseInt(params.tokenizedValue) },
          { trait_type: 'Collateral Type', value: params.collateralType },
          { trait_type: 'Deed Hash', value: deedHash || 'Not uploaded' },
        ],
        external_url: '',
      };

      // Step 4: Upload metadata to IPFS
      updateStep('uploadMetadata', 'processing', 'Uploading metadata to IPFS...');
      let metadataHash = '';
      try {
        metadataHash = await uploadPropertyMetadataToIPFS(metadata);
        updateStep('uploadMetadata', 'completed', `Metadata uploaded: ${metadataHash}`);
      } catch (error) {
        updateStep('uploadMetadata', 'error', `Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }

      // Step 5: Mint property token on blockchain
      updateStep('mintToken', 'processing', 'Minting property token on blockchain...');
      try {
        mintPropertyToken({
          to: address,
          valuation: params.valuation,
          tokenizedPortion: parseInt(params.tokenizedPortion),
          tokenizedValue: params.tokenizedValue,
          collateralType: params.collateralType,
          tokenURI: `ipfs://${metadataHash}`,
        });
        // Don't set isProcessing to false here - wait for confirmation
      } catch (error) {
        updateStep('mintToken', 'error', `Failed to mint token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsProcessing(false);
        throw error;
      }
    } catch (error) {
      console.error('Error tokenizing property:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  // Update mint step when transaction hash is available
  useEffect(() => {
    if (hash) {
      const mintStep = steps.find((s) => s.step === 'mintToken');
      if (mintStep?.status === 'processing') {
        updateStep('mintToken', 'processing', `Transaction submitted: ${hash.slice(0, 10)}...`);
      }
    }
  }, [hash]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update mint step when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      const mintStep = steps.find((s) => s.step === 'mintToken');
      if (mintStep?.status !== 'completed') {
        updateStep('mintToken', 'completed', `Token minted successfully!`);
        setIsProcessing(false);
      }
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update mint step if there's an error
  useEffect(() => {
    if (error) {
      const mintStep = steps.find((s) => s.step === 'mintToken');
      if (mintStep?.status !== 'error') {
        updateStep('mintToken', 'error', `Transaction failed: ${error.message}`);
        setIsProcessing(false);
      }
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tokenizeProperty,
    steps,
    isProcessing: isProcessing || isPending || isConfirming,
    hash,
    isConfirmed,
    error,
  };
}

