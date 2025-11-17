import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI } from '@/lib/loanContract';
import { useChainId } from 'wagmi';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fund a loan from the liquidity pool
 */
export const useFundLoan = () => {
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);

  const {
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

  const fundLoan = async (loanId: bigint | string) => {
    if (!loanContractAddress) {
      toast({
        title: 'Contract not configured',
        description: 'Loan contract address not set for this network',
        variant: 'destructive',
      });
      return;
    }

    try {
      const loanIdBigInt = typeof loanId === 'string' ? BigInt(loanId) : loanId;

      await writeContractAsync({
        address: loanContractAddress,
        abi: LOAN_CONTRACT_ABI,
        functionName: 'fundLoanFromPool',
        args: [loanIdBigInt],
      });
    } catch (error: any) {
      console.error('Error funding loan:', error);
      const errorMessage = error?.message || error?.shortMessage || 'Unknown error occurred';
      
      // Provide more specific error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        userFriendlyMessage = 'The liquidity pool does not have enough USDT to fund this loan. Please deposit more USDT to the pool first.';
      } else if (errorMessage.includes('status') || errorMessage.includes('not open')) {
        userFriendlyMessage = 'This loan is not in a state that can be funded. It may already be funded or closed.';
      } else if (errorMessage.includes('already funded')) {
        userFriendlyMessage = 'This loan has already been funded.';
      }
      
      toast({
        title: 'Error funding loan',
        description: userFriendlyMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Show toast notifications
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Loan funded successfully',
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}. Pool balance has been updated.`,
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
    fundLoan,
    isPending: isWriting || isConfirming,
    isSuccess: isConfirmed,
    hash,
    error: writeError || receiptError,
  };
};

