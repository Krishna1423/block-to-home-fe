import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI } from '@/lib/loanContract';
import { getLoanEscrowAddress, LOAN_ESCROW_ABI } from '@/lib/loanEscrow';
import { getPropertyTokenAddress, PROPERTY_TOKEN_ABI } from '@/lib/contracts';
import { useChainId, useAccount } from 'wagmi';
import { parseUSDTAmount } from '@/lib/contracts';
import { toast } from '@/hooks/use-toast';
import { waitForTransactionReceipt, getPublicClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';

export interface CreateLoanParams {
  propertyTokenId: string;
  loanAmount: string; // In USDT (as string, e.g., "1000")
  interestRate: number; // Percentage (e.g., 5.0 for 5%)
  duration: number; // In months
}

/**
 * Hook to create a loan request
 */
export const useCreateLoan = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const loanContractAddress = getLoanContractAddress(chainId);
  const loanEscrowAddress = getLoanEscrowAddress(chainId);
  const propertyTokenAddress = getPropertyTokenAddress(chainId);

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
      retry: 3,
      retryDelay: 2000,
    },
    pollingInterval: 2000, // Poll every 2 seconds
    timeout: 120000, // 2 minute timeout
  });


  const createLoan = async (params: CreateLoanParams) => {
    if (!loanContractAddress) {
      toast({
        title: 'Contract not configured',
        description: 'Loan contract address not set for this network',
        variant: 'destructive',
      });
      return;
    }

    if (!loanEscrowAddress || !propertyTokenAddress) {
      toast({
        title: 'Contract not configured',
        description: 'LoanEscrow or PropertyToken address not set for this network',
        variant: 'destructive',
      });
      return;
    }

    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert loan amount to USDT (6 decimals)
      const loanAmountWei = parseUSDTAmount(params.loanAmount);
      
      // Convert interest rate to basis points (e.g., 5.0% = 500 basis points)
      const interestRateBasisPoints = BigInt(Math.round(params.interestRate * 100));
      
      // Convert property token ID to bigint
      const propertyTokenId = BigInt(params.propertyTokenId);
      
      // Convert duration to bigint
      const durationMonths = BigInt(params.duration);

      // Step 1: Check and approve PropertyToken to LoanEscrow if needed
      // Check current approval
      const publicClient = getPublicClient(wagmiConfig);
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const currentApproval = await publicClient.readContract({
        address: propertyTokenAddress,
        abi: PROPERTY_TOKEN_ABI,
        functionName: 'getApproved',
        args: [propertyTokenId],
      });

      const needsApproval = !currentApproval || 
        currentApproval.toLowerCase() !== loanEscrowAddress.toLowerCase();

      if (needsApproval) {
        toast({
          title: 'Approval required',
          description: 'Please approve the transaction to allow the escrow to hold your property',
        });

        // Approve PropertyToken to LoanEscrow
        const approveHash = await writeContractAsync({
          address: propertyTokenAddress,
          abi: PROPERTY_TOKEN_ABI,
          functionName: 'approve',
          args: [loanEscrowAddress, propertyTokenId],
        });

        // Wait for approval transaction to be confirmed
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
        
        toast({
          title: 'Approval successful',
          description: 'Creating loan request...',
        });
      }

      // Step 2: Create loan request
      await writeContractAsync({
        address: loanContractAddress,
        abi: LOAN_CONTRACT_ABI,
        functionName: 'createLoanRequest',
        args: [
          propertyTokenId,
          loanAmountWei,
          interestRateBasisPoints,
          durationMonths,
        ],
      });
    } catch (error: any) {
      console.error('Error creating loan:', error);
      
      // Check if it's an approval error
      const errorMessage = error?.message || error?.shortMessage || 'Unknown error occurred';
      
      if (errorMessage.includes('ERC721: transfer caller is not owner nor approved') || 
          errorMessage.includes('ERC721: approve caller is not owner nor approved') ||
          errorMessage.includes('approval')) {
        toast({
          title: 'Approval required',
          description: 'Please approve the PropertyToken to LoanEscrow contract first',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error creating loan',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw error; // Re-throw so caller can handle it
    }
  };

  // Show toast notifications
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Loan request created successfully',
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
    }
  }, [isConfirmed, hash]);

  React.useEffect(() => {
    if (writeError) {
      toast({
        title: 'Transaction failed',
        description: writeError.message,
        variant: 'destructive',
      });
    }
  }, [writeError]);

  React.useEffect(() => {
    if (receiptError) {
      toast({
        title: 'Transaction confirmation failed',
        description: receiptError.message,
        variant: 'destructive',
      });
    }
  }, [receiptError]);

  return {
    createLoan,
    isPending: isWriting || isConfirming,
    isSuccess: isConfirmed,
    hash,
    error: writeError || receiptError,
  };
};

