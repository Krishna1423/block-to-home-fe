import React from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getLiquidityPoolAddress, LIQUIDITY_POOL_ABI } from '@/lib/liquidityPool';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for withdrawing funds from the liquidity pool
 * Investors can withdraw their share of available balance (principal + returns)
 */
export const usePoolWithdraw = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const poolAddress = getLiquidityPoolAddress(chainId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's participant data to calculate max withdrawable
  const { data: participantData } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getParticipant',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddress,
    },
  });

  // Get pool balances
  const { data: totalPoolBalance } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalPoolBalance',
    query: {
      enabled: !!poolAddress,
    },
  });

  const { data: totalLoansFunded } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalLoansFunded',
    query: {
      enabled: !!poolAddress,
    },
  });

  const { data: totalShareTokens } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalShareTokens',
    query: {
      enabled: !!poolAddress,
    },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 2000,
    timeout: 120000,
    retry: 3,
    retryDelay: 2000,
  });

  // Calculate max withdrawable amount
  const maxWithdrawable = React.useMemo(() => {
    if (!participantData || 
        participantData[2] === undefined || 
        !totalPoolBalance || 
        !totalLoansFunded || 
        !totalShareTokens) {
      return 0;
    }

    const participant = {
      shareTokens: BigInt(participantData[2] as bigint),
    };

    // Available balance = totalPoolBalance - totalLoansFunded
    const availableBalance = totalPoolBalance - totalLoansFunded;
    
    if (totalShareTokens === 0n || availableBalance <= 0n) {
      return 0;
    }

    // Calculate investor's share percentage
    const sharePercentage = Number(participant.shareTokens) / Number(totalShareTokens);
    
    // Max withdrawable = available balance * share percentage
    const maxWithdraw = availableBalance * BigInt(Math.floor(sharePercentage * 10000)) / 10000n;
    
    return Number(formatUnits(maxWithdraw, 6));
  }, [participantData, totalPoolBalance, totalLoansFunded, totalShareTokens]);

  const withdraw = React.useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to withdraw funds',
          variant: 'destructive',
        });
        return;
      }

      if (!poolAddress) {
        toast({
          title: 'Contract not configured',
          description: 'LiquidityPool contract not found for this network',
          variant: 'destructive',
        });
        return;
      }

      const amountWei = parseUnits(amount, 6);
      const maxWithdrawWei = parseUnits(maxWithdrawable.toFixed(6), 6);

      if (amountWei > maxWithdrawWei) {
        toast({
          title: 'Insufficient available balance',
          description: `You can withdraw up to ${maxWithdrawable.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`,
          variant: 'destructive',
        });
        return;
      }

      try {
        console.log('💸 Withdrawing from pool...', { amount, amountWei: amountWei.toString() });
        
        toast({
          title: 'Withdrawal initiated',
          description: 'Please confirm the transaction in your wallet',
        });

        writeContract({
          address: poolAddress,
          abi: LIQUIDITY_POOL_ABI,
          functionName: 'withdraw',
          args: [amountWei],
        });
      } catch (err) {
        console.error('Error withdrawing from pool:', err);
        toast({
          title: 'Withdrawal failed',
          description: err instanceof Error ? err.message : 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    },
    [isConnected, address, poolAddress, maxWithdrawable, writeContract, toast]
  );

  // Handle transaction confirmation
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Withdrawal successful!',
        description: 'Your funds have been withdrawn from the pool',
      });

      // Invalidate queries to refetch pool balance and participant data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as any[];
          if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
          const config = queryKey[1] as any;
          return (
            config?.address?.toLowerCase() === poolAddress?.toLowerCase() &&
            (config?.functionName === 'getParticipant' ||
              config?.functionName === 'totalPoolBalance' ||
              config?.functionName === 'totalLoansFunded' ||
              config?.functionName === 'totalShareTokens')
          );
        },
      });
    }
  }, [isConfirmed, hash, toast, queryClient, poolAddress]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Withdrawal failed',
        description: error.message || 'Transaction failed',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isPending || isConfirming,
    error,
    maxWithdrawable,
  };
};

