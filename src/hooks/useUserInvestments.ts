import { useAccount, useChainId, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { getLiquidityPoolAddress, LIQUIDITY_POOL_ABI } from '@/lib/liquidityPool';

/**
 * Hook to fetch user's investment data from the LiquidityPool contract
 * Returns deposit amount, share tokens, and calculated returns
 */
export const useUserInvestments = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const poolAddress = getLiquidityPoolAddress(chainId);

  // Fetch user's participant data
  const { data: participantData, isLoading: isLoadingParticipant, error: participantError } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getParticipant',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddress,
      staleTime: 10000, // 10 seconds
    },
  });

  // Fetch total returns received by the pool
  const { data: totalReturnsReceived, isLoading: isLoadingReturns } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalReturnsReceived',
    query: {
      enabled: !!poolAddress,
      staleTime: 10000,
    },
  });

  // Fetch total share tokens
  const { data: totalShareTokens, isLoading: isLoadingShares } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalShareTokens',
    query: {
      enabled: !!poolAddress,
      staleTime: 10000,
    },
  });

  // Parse participant data
  const participant = participantData && 
    participantData[0] !== undefined && 
    participantData[1] !== undefined &&
    participantData[2] !== undefined &&
    participantData[3] !== undefined &&
    participantData[4] !== undefined &&
    participantData[5] !== undefined &&
    participantData[6] !== undefined
    ? {
        investor: participantData[0] as `0x${string}`,
        depositAmount: BigInt(participantData[1] as bigint),
        shareTokens: BigInt(participantData[2] as bigint),
        totalDeposited: BigInt(participantData[3] as bigint),
        totalWithdrawn: BigInt(participantData[4] as bigint),
        lastDepositAt: BigInt(participantData[5] as bigint),
        isActive: participantData[6] as boolean,
      }
    : null;

  // Calculate user's share percentage
  const sharePercentage = participant && 
    totalShareTokens !== undefined && 
    totalShareTokens !== null && 
    totalShareTokens > 0n
    ? Number(participant.shareTokens) / Number(totalShareTokens)
    : 0;

  // Calculate user's returns based on their share
  const userReturns = participant && 
    totalReturnsReceived !== undefined && 
    totalReturnsReceived !== null &&
    totalShareTokens !== undefined && 
    totalShareTokens !== null && 
    totalShareTokens > 0n
    ? BigInt(Math.floor(Number(totalReturnsReceived) * sharePercentage))
    : 0n;

  // Calculate monthly returns (approximate - based on total returns and time)
  // This is a simplified calculation - in production, you'd want to track returns over time
  const monthlyReturns = userReturns > 0n && participant && participant.lastDepositAt > 0n
    ? (() => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const timeSinceDeposit = now - participant.lastDepositAt;
        const monthsSinceDeposit = Number(timeSinceDeposit) / (30 * 24 * 60 * 60); // Approximate months
        if (monthsSinceDeposit > 0) {
          return Number(userReturns) / monthsSinceDeposit;
        }
        return Number(userReturns);
      })()
    : 0;

  return {
    // Investment data
    totalDeposited: participant ? Number(formatUnits(participant.totalDeposited, 6)) : 0,
    totalWithdrawn: participant ? Number(formatUnits(participant.totalWithdrawn, 6)) : 0,
    currentDeposit: participant ? Number(formatUnits(participant.depositAmount, 6)) : 0,
    shareTokens: participant ? Number(formatUnits(participant.shareTokens, 6)) : 0, // Share tokens use same decimals as USDT (6)
    sharePercentage: sharePercentage * 100, // As percentage
    
    // Returns data
    totalReturns: userReturns ? Number(formatUnits(userReturns, 6)) : 0,
    monthlyReturns: monthlyReturns > 0 ? Number(formatUnits(BigInt(Math.floor(monthlyReturns)), 6)) : 0,
    
    // Status
    isActive: participant?.isActive ?? false,
    hasInvestments: participant ? participant.totalDeposited > 0n : false,
    
    // Loading states
    isLoading: isLoadingParticipant || isLoadingReturns || isLoadingShares,
    error: participantError,
    
    // Raw data for advanced calculations
    rawParticipant: participant,
    rawTotalReturns: totalReturnsReceived,
    rawTotalShares: totalShareTokens,
  };
};

