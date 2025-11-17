import React from 'react';
import { useReadContract, useBalance } from 'wagmi';
import { formatUSDTBalance, getUSDTAddress, USDT_ABI } from '@/lib/contracts';
import { useAccount, useChainId } from 'wagmi';

/**
 * Hook to get USDT balance for the connected wallet
 * Falls back to native token balance if USDT is not available on the chain
 */
export const useUSDTBalance = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const usdtAddress = getUSDTAddress(chainId);

  // Debug logging
  React.useEffect(() => {
    if (isConnected && address) {
      console.log('🔍 USDT Balance Hook Debug:', {
        chainId,
        usdtAddress,
        walletAddress: address,
        isConnected,
      });
    }
  }, [chainId, usdtAddress, address, isConnected]);

  // Get USDT balance if contract address exists for this chain
  const { data: usdtBalance, ...usdtQuery } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!usdtAddress,
    },
  });

  // Debug balance result
  React.useEffect(() => {
    if (usdtBalance !== undefined) {
      console.log('💰 USDT Balance Result:', {
        rawBalance: usdtBalance?.toString(),
        formatted: formatUSDTBalance(usdtBalance as bigint),
        error: usdtQuery.error,
      });
    }
  }, [usdtBalance, usdtQuery.error]);

  // Fallback to native token balance if USDT is not available
  const { data: nativeBalance, ...nativeQuery } = useBalance({
    address: address,
    query: {
      enabled: isConnected && !!address && !usdtAddress,
    },
  });

  // Determine which balance to use
  const hasUSDT = !!usdtAddress;
  const balance = hasUSDT ? usdtBalance : nativeBalance?.value;
  const isLoading = hasUSDT ? usdtQuery.isLoading : nativeQuery.isLoading;
  const isError = hasUSDT ? usdtQuery.isError : nativeQuery.isError;
  const error = hasUSDT ? usdtQuery.error : nativeQuery.error;

  // Format balance for display
  const formattedBalance = balance
    ? hasUSDT
      ? formatUSDTBalance(balance as bigint)
      : nativeBalance?.formatted || '0'
    : '0';

  // Get symbol
  const symbol = hasUSDT ? 'USDT' : nativeBalance?.symbol || '';

  return {
    balance: balance as bigint | undefined,
    formattedBalance,
    symbol,
    isLoading,
    isError,
    error,
    hasUSDT,
    refetch: hasUSDT ? usdtQuery.refetch : nativeQuery.refetch,
  };
};

