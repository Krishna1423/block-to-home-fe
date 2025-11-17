import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI } from '@/lib/loanContract';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for liquidating collateral on defaulted loans
 * Note: This is typically an admin/owner function
 */
export const useLiquidateCollateral = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);

  const { writeContract: liquidate, data: hash, isPending } = useWriteContract();

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
    pollingInterval: 2000,
    timeout: 120000,
  });

  /**
   * Liquidate collateral for a defaulted loan
   * @param loanId The loan ID to liquidate
   */
  const liquidateLoan = React.useCallback(
    async (loanId: string) => {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet',
          variant: 'destructive',
        });
        return;
      }

      if (!loanContractAddress) {
        toast({
          title: 'Contract not configured',
          description: 'Loan contract not found for this network',
          variant: 'destructive',
        });
        return;
      }

      try {
        console.log('💀 Liquidating collateral for loan:', loanId);
        liquidate({
          address: loanContractAddress,
          abi: LOAN_CONTRACT_ABI,
          functionName: 'liquidateCollateral',
          args: [BigInt(loanId)],
        });
      } catch (error: any) {
        console.error('Error liquidating collateral:', error);
        const errorMessage = error?.message || error?.reason || 'Unknown error occurred';
        let userFriendlyMessage = errorMessage;

        if (errorMessage.includes('not in default')) {
          userFriendlyMessage = 'This loan is not yet in default. Loans must be overdue by more than 90 days.';
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('only owner')) {
          userFriendlyMessage = 'Only the contract owner can liquidate collateral.';
        } else if (errorMessage.includes('not active')) {
          userFriendlyMessage = 'This loan is not active and cannot be liquidated.';
        }

        toast({
          title: 'Liquidation failed',
          description: userFriendlyMessage,
          variant: 'destructive',
        });
      }
    },
    [isConnected, address, loanContractAddress, liquidate]
  );

  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Collateral liquidated',
        description: `Loan collateral has been liquidated. Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
    }
  }, [isConfirmed, hash]);

  React.useEffect(() => {
    if (receiptError) {
      toast({
        title: 'Liquidation failed',
        description: receiptError.message || 'Failed to liquidate collateral',
        variant: 'destructive',
      });
    }
  }, [receiptError]);

  return {
    liquidateLoan,
    isPending: isPending || isConfirming,
    isSuccess: isConfirmed,
    hash,
  };
};


