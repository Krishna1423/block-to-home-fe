import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useAvailableLoans } from './useLoans';
import { useUserInvestments } from './useUserInvestments';

/**
 * Hook to get loans that the investor has exposure to through the liquidity pool
 * Since the system uses a pool-based model, investors have exposure to all funded/active loans
 * based on their pool share percentage
 */
export const useInvestorLoans = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { loans: allLoans, isLoading: isLoadingLoans } = useAvailableLoans();
  const { 
    sharePercentage, 
    totalDeposited, 
    hasInvestments,
    isLoading: isLoadingInvestments 
  } = useUserInvestments();

  // Filter loans that are funded/active (these generate returns for the pool)
  const investorLoans = React.useMemo(() => {
    // Debug logging
    console.log('🔍 useInvestorLoans Debug:', {
      allLoansCount: allLoans?.length || 0,
      hasInvestments,
      sharePercentage,
      totalDeposited,
      loans: allLoans?.map(l => ({ id: l.loanId, status: l.status })) || [],
    });

    if (!allLoans || allLoans.length === 0) {
      console.log('⚠️ No loans found');
      return [];
    }

    if (!hasInvestments) {
      console.log('⚠️ User has no investments');
      return [];
    }

    if (sharePercentage === 0 || sharePercentage === undefined) {
      console.log('⚠️ Share percentage is 0 or undefined');
      return [];
    }

    const filteredLoans = allLoans.filter(loan => 
      loan.status === 'FUNDED' || 
      loan.status === 'ACTIVE' || 
      loan.status === 'COMPLETED'
    );

    console.log('✅ Filtered loans:', {
      totalLoans: allLoans.length,
      filteredCount: filteredLoans.length,
      filteredStatuses: filteredLoans.map(l => l.status),
    });

    return filteredLoans
      .map(loan => {
        // Calculate investor's share of this loan based on pool share
        // sharePercentage is already a percentage (0-100), so divide by 100
        const loanAmount = loan.loanAmount;
        const shareDecimal = sharePercentage / 100; // Convert percentage to decimal
        const investorShareOfLoan = loanAmount * shareDecimal;
        
        // Calculate expected returns (simplified - based on interest rate)
        const interestRate = loan.interestRate / 100; // Convert from basis points to percentage
        const expectedTotalReturn = loanAmount * (interestRate / 100) * (loan.duration / 12);
        const investorExpectedReturn = expectedTotalReturn * shareDecimal;
        
        // Calculate actual returns received (based on payments made)
        const amountPaid = loan.amountPaid || 0;
        const totalOwed = loan.totalOwed || loanAmount;
        const principalPaid = Math.min(amountPaid, loanAmount);
        const interestPaid = Math.max(0, amountPaid - principalPaid);
        const investorInterestReceived = interestPaid * shareDecimal;
        
        // Calculate progress
        const paymentProgress = totalOwed > 0 ? (amountPaid / totalOwed) * 100 : 0;
        const isCompleted = loan.status === 'COMPLETED';
        const isActive = loan.status === 'ACTIVE';

        return {
          loanId: loan.loanId,
          borrower: loan.borrower,
          loanAmount,
          fundedAmount: loan.fundedAmount || loanAmount,
          interestRate: loan.interestRate,
          duration: loan.duration,
          status: loan.status,
          propertyValue: loan.propertyValue,
          propertyAddress: loan.propertyAddress,
          collateralType: loan.collateralType,
          createdAt: loan.createdAt,
          fundedAt: loan.fundedAt,
          nextPaymentDue: loan.nextPaymentDue,
          
          // Investor-specific data
          investorShareOfLoan,
          investorExpectedReturn,
          investorInterestReceived,
          paymentProgress,
          isCompleted,
          isActive,
          amountPaid,
          totalOwed,
        };
      });
  }, [allLoans, hasInvestments, sharePercentage]);

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!investorLoans || investorLoans.length === 0) {
      return {
        totalExposure: 0,
        totalExpectedReturns: 0,
        totalReturnsReceived: 0,
        activeLoans: 0,
        completedLoans: 0,
      };
    }

    return {
      totalExposure: investorLoans.reduce((sum, loan) => sum + loan.investorShareOfLoan, 0),
      totalExpectedReturns: investorLoans.reduce((sum, loan) => sum + loan.investorExpectedReturn, 0),
      totalReturnsReceived: investorLoans.reduce((sum, loan) => sum + loan.investorInterestReceived, 0),
      activeLoans: investorLoans.filter(loan => loan.isActive).length,
      completedLoans: investorLoans.filter(loan => loan.isCompleted).length,
    };
  }, [investorLoans]);

  return {
    loans: investorLoans,
    totals,
    isLoading: isLoadingLoans || isLoadingInvestments,
    hasInvestments,
    sharePercentage,
    totalDeposited,
  };
};

