import React from 'react';
import { useReadContract, useReadContracts, useAccount, useChainId } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI, formatLoanAmount } from '@/lib/loanContract';

export interface PaymentData {
  paymentId: string;
  loanId: string;
  amount: string; // Formatted USDT amount
  amountRaw: bigint; // Raw amount in USDT (6 decimals)
  timestamp: number; // Unix timestamp
  payer: string; // Payer address
}

/**
 * Hook to fetch payment history for a loan
 */
export const useLoanPayments = (loanId: string | undefined) => {
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);

  // Get payment IDs for the loan
  const { data: paymentIds, refetch: refetchPaymentIds } = useReadContract({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'getLoanPayments',
    args: loanId ? [BigInt(loanId)] : undefined,
    query: {
      enabled: !!loanId && !!loanContractAddress,
    },
  });

  // Fetch all payment details
  const paymentContracts = React.useMemo(() => {
    if (!paymentIds || !loanContractAddress) return [];
    return paymentIds.map((paymentId: bigint) => ({
      address: loanContractAddress,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'payments' as const,
      args: [paymentId],
    }));
  }, [paymentIds, loanContractAddress]);

  const { data: paymentsData, refetch: refetchPayments } = useReadContracts({
    contracts: paymentContracts,
    query: {
      enabled: paymentContracts.length > 0,
    },
  });

  // Transform payment data
  const payments: PaymentData[] = React.useMemo(() => {
    if (!paymentsData || !paymentIds) return [];

    return paymentsData
      .map((payment: any, index: number) => {
        if (!payment || !payment.result) return null;

        const paymentResult = payment.result as {
          paymentId: bigint;
          loanId: bigint;
          amount: bigint;
          timestamp: bigint;
          payer: `0x${string}`;
        };

        return {
          paymentId: paymentResult.paymentId.toString(),
          loanId: paymentResult.loanId.toString(),
          amount: formatLoanAmount(paymentResult.amount),
          amountRaw: paymentResult.amount,
          timestamp: Number(paymentResult.timestamp),
          payer: paymentResult.payer,
        };
      })
      .filter((p): p is PaymentData => p !== null)
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  }, [paymentsData, paymentIds]);

  const refetch = React.useCallback(() => {
    refetchPaymentIds();
    refetchPayments();
  }, [refetchPaymentIds, refetchPayments]);

  return {
    payments,
    isLoading: !paymentIds && !!loanId,
    refetch,
  };
};


