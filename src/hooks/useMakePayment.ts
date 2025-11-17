import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI, parseLoanAmount, formatLoanAmount } from '@/lib/loanContract';
import { getUSDTAddress, USDT_ABI } from '@/lib/contracts';
import { toast } from '@/hooks/use-toast';
import { parseUnits, formatUnits } from 'viem';

/**
 * Hook for making loan payments
 * Handles USDT approval and payment transaction
 */
export const useMakePayment = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);
  const usdtAddress = getUSDTAddress(chainId);

  // Check USDT allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: address && loanContractAddress ? [address, loanContractAddress] : undefined,
    query: {
      enabled: isConnected && !!address && !!loanContractAddress && !!usdtAddress,
    },
  });

  // Write contract for USDT approval
  const { writeContract: approveUSDT, data: approveHash, isPending: isApproving } = useWriteContract();

  // Write contract for making payment
  const { writeContract: makePayment, data: paymentHash, isPending: isPendingPayment } = useWriteContract();

  // Wait for approval transaction
  const {
    isLoading: isConfirmingApproval,
    isSuccess: isApproved,
    error: approvalError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: !!approveHash,
      retry: 3,
      retryDelay: 2000,
    },
    pollingInterval: 2000,
    timeout: 120000,
  });

  // Wait for payment transaction
  const {
    isLoading: isConfirmingPayment,
    isSuccess: isPaymentConfirmed,
    error: paymentError,
  } = useWaitForTransactionReceipt({
    hash: paymentHash,
    query: {
      enabled: !!paymentHash,
      retry: 3,
      retryDelay: 2000,
    },
    pollingInterval: 2000,
    timeout: 120000,
  });

  /**
   * Make a payment towards a loan
   * @param loanId The loan ID
   * @param amount Payment amount in USDT (as string, e.g., "100.50")
   */
  const payLoan = React.useCallback(
    async (loanId: string, amount: string) => {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to make a payment',
          variant: 'destructive',
        });
        return;
      }

      if (!loanContractAddress || !usdtAddress) {
        toast({
          title: 'Contract not configured',
          description: 'Loan contract or USDT contract not found for this network',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Parse amount to USDT (6 decimals)
        const amountBigInt = parseLoanAmount(amount);
        const amountWei = parseUnits(amount, 6);

        // Check if approval is needed
        const currentAllowance = allowance || BigInt(0);
        if (currentAllowance < amountWei) {
          // Need to approve first
          console.log('🔐 Approving USDT for payment...');
          toast({
            title: 'Approval required',
            description: 'Please approve USDT spending in your wallet',
          });

          approveUSDT({
            address: usdtAddress,
            abi: USDT_ABI,
            functionName: 'approve',
            args: [loanContractAddress, amountWei],
          });

          // Wait for approval to complete
          return;
        }

        // Make payment
        console.log('💳 Making payment...', { loanId, amount });
        makePayment({
          address: loanContractAddress,
          abi: LOAN_CONTRACT_ABI,
          functionName: 'makePayment',
          args: [BigInt(loanId), amountWei],
        });
      } catch (error: any) {
        console.error('Error making payment:', error);
        const errorMessage = error?.message || error?.reason || 'Unknown error occurred';
        let userFriendlyMessage = errorMessage;

        if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
          userFriendlyMessage = 'Insufficient USDT balance. Please ensure you have enough USDT to make this payment.';
        } else if (errorMessage.includes('allowance')) {
          userFriendlyMessage = 'USDT approval required. Please approve USDT spending first.';
        } else if (errorMessage.includes('not active') || errorMessage.includes('not in payment phase')) {
          userFriendlyMessage = 'This loan is not in a state that allows payments.';
        } else if (errorMessage.includes('only borrower')) {
          userFriendlyMessage = 'Only the borrower can make payments for this loan.';
        }

        toast({
          title: 'Payment failed',
          description: userFriendlyMessage,
          variant: 'destructive',
        });
      }
    },
    [isConnected, address, loanContractAddress, usdtAddress, allowance, approveUSDT, makePayment]
  );

  // Handle approval completion
  React.useEffect(() => {
    if (isApproved && approveHash) {
      console.log('✅ USDT approved, refetching allowance...');
      refetchAllowance();
      toast({
        title: 'Approval successful',
        description: 'USDT has been approved. You can now make the payment.',
      });
    }
  }, [isApproved, approveHash, refetchAllowance]);

  // Handle payment completion
  React.useEffect(() => {
    if (isPaymentConfirmed && paymentHash) {
      toast({
        title: 'Payment successful',
        description: `Payment confirmed. Transaction: ${paymentHash.slice(0, 10)}...${paymentHash.slice(-8)}`,
      });
    }
  }, [isPaymentConfirmed, paymentHash]);

  // Handle errors
  React.useEffect(() => {
    if (approvalError) {
      toast({
        title: 'Approval failed',
        description: approvalError.message || 'Failed to approve USDT spending',
        variant: 'destructive',
      });
    }
  }, [approvalError]);

  React.useEffect(() => {
    if (paymentError) {
      toast({
        title: 'Payment failed',
        description: paymentError.message || 'Failed to process payment',
        variant: 'destructive',
      });
    }
  }, [paymentError]);

  return {
    payLoan,
    isPending: isApproving || isConfirmingApproval || isPendingPayment || isConfirmingPayment,
    isApproving,
    isPendingPayment,
    isSuccess: isPaymentConfirmed,
    hash: paymentHash,
    approvalHash: approveHash,
  };
};


