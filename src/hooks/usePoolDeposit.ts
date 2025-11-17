import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getLiquidityPoolAddress, LIQUIDITY_POOL_ABI } from '@/lib/liquidityPool';
import { getUSDTAddress, USDT_ABI, parseUSDTAmount } from '@/lib/contracts';
import { useChainId, useAccount } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { waitForTransactionReceipt, getPublicClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';

/**
 * Hook to deposit USDT into the liquidity pool
 */
export const usePoolDeposit = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const liquidityPoolAddress = getLiquidityPoolAddress(chainId);
  const usdtAddress = getUSDTAddress(chainId);

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

  // Get minimum deposit amount
  const { data: minDepositAmount } = useReadContract({
    address: liquidityPoolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'minDepositAmount',
    query: {
      enabled: !!liquidityPoolAddress,
    },
  });

  const deposit = async (amount: string) => {
    if (!liquidityPoolAddress) {
      toast({
        title: 'Contract not configured',
        description: 'Liquidity pool address not set for this network',
        variant: 'destructive',
      });
      return;
    }

    if (!usdtAddress) {
      toast({
        title: 'USDT not configured',
        description: 'USDT contract address not set for this network',
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
      // Convert amount to USDT (6 decimals)
      const amountWei = parseUSDTAmount(amount);

      // Check minimum deposit
      if (minDepositAmount && amountWei < minDepositAmount) {
        const minAmount = Number(minDepositAmount) / 1e6;
        toast({
          title: 'Deposit too small',
          description: `Minimum deposit is ${minAmount} USDT`,
          variant: 'destructive',
        });
        return;
      }

      // Step 1: Check USDT balance first
      const publicClient = getPublicClient(wagmiConfig);
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const currentBalance = await publicClient.readContract({
        address: usdtAddress,
        abi: USDT_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      if (currentBalance < amountWei) {
        const balanceFormatted = Number(currentBalance) / 1e6;
        toast({
          title: 'Insufficient USDT balance',
          description: `You have ${balanceFormatted.toFixed(2)} USDT, but need ${amount} USDT. Please mint or acquire more USDT first.`,
          variant: 'destructive',
        });
        throw new Error(`Insufficient balance: have ${balanceFormatted}, need ${amount}`);
      }

      // Step 2: Check and approve USDT if needed
      const currentAllowance = await publicClient.readContract({
        address: usdtAddress,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [address, liquidityPoolAddress],
      });

      const needsApproval = currentAllowance < amountWei;

      if (needsApproval) {
        toast({
          title: 'Approval required',
          description: 'Please approve USDT spending for the liquidity pool',
        });

        // Approve USDT to LiquidityPool (approve max to avoid repeated approvals)
        const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        const approveHash = await writeContractAsync({
          address: usdtAddress,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [liquidityPoolAddress, maxApproval],
        });

        // Wait for approval transaction to be confirmed
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });

        toast({
          title: 'Approval successful',
          description: 'Depositing to pool...',
        });
      }

      // Step 2: Deposit to pool
      await writeContractAsync({
        address: liquidityPoolAddress,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'deposit',
        args: [amountWei],
      });
    } catch (error: any) {
      console.error('Error depositing to pool:', error);
      const errorMessage = error?.message || error?.shortMessage || 'Unknown error occurred';

      if (errorMessage.includes('allowance') || errorMessage.includes('approve')) {
        toast({
          title: 'Approval required',
          description: 'Please approve USDT spending for the liquidity pool first',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('insufficient') && errorMessage.includes('balance')) {
        toast({
          title: 'Insufficient USDT balance',
          description: 'You don\'t have enough USDT. Please mint MockUSDT tokens first using the minting script.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('minimum')) {
        toast({
          title: 'Deposit too small',
          description: `Minimum deposit is ${minDepositAmount} USDT`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error depositing to pool',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  // Show toast notifications
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Deposit successful',
        description: `Transaction confirmed: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
    }
  }, [isConfirmed, hash]);

  // Debug: Log confirmation status
  React.useEffect(() => {
    if (hash) {
      console.log('📝 Deposit Transaction Status:', {
        hash,
        isConfirming,
        isConfirmed,
        error: receiptError,
      });
    }
  }, [hash, isConfirming, isConfirmed, receiptError]);

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
    deposit,
    isPending: isWriting || isConfirming,
    isSuccess: isConfirmed,
    hash,
    error: writeError || receiptError,
    minDepositAmount: minDepositAmount ? Number(minDepositAmount) / 1e6 : 100, // Default to 100 USDT
  };
};

