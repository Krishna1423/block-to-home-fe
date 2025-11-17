import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { getLoanContractAddress, LOAN_CONTRACT_ABI, LoanData, LoanStatus, getLoanStatusString } from '@/lib/loanContract';
import { useAccount, useChainId } from 'wagmi';
import { useMemo, useState, useEffect } from 'react';
import { getPropertyTokenAddress, PROPERTY_TOKEN_ABI } from '@/lib/contracts';
import { fetchMetadataFromIPFS, getIPFSUrl } from '@/lib/ipfs';

export interface Loan {
  loanId: string;
  borrower: string;
  propertyTokenId: string;
  loanAmount: number; // In USDT (6 decimals)
  duration: number; // In months
  interestRate: number; // Percentage (e.g., 5.0 = 5%)
  fundedAmount: number; // In USDT (6 decimals)
  fundedPercentage: number; // 0-100
  status: 'PENDING' | 'OPEN' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  createdAt: number;
  fundedAt: number;
  monthlyPayment: number;
  totalOwed: number;
  amountPaid: number;
  nextPaymentDue: number;
  isActive: boolean;
  // Property details (fetched from PropertyToken contract)
  propertyValue?: number;
  propertyAddress?: string;
  propertyImageUrl?: string;
  collateralType?: string;
  tokenizedPortion?: number;
  tokenizedValue?: number;
}

/**
 * Hook to get all available loans (for investors)
 * Since the contract doesn't have getAllLoans(), we track loans via events
 * For now, we'll use a simple approach: try to fetch loans by ID (0-100)
 * In production, you'd want to use event indexing or add getAllLoans() to the contract
 */
export const useAvailableLoans = () => {
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);
  const [trackedLoanIds, setTrackedLoanIds] = useState<bigint[]>([]);

  // Watch for new loan creation events
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanRequestCreated',
    onLogs(logs) {
      logs.forEach((log) => {
        const loanId = log.args.loanId;
        if (loanId !== undefined && !trackedLoanIds.includes(loanId)) {
          setTrackedLoanIds((prev) => [...prev, loanId]);
        }
      });
    },
  });

  // For now, try to fetch loans by checking IDs 0-100
  // This is a workaround - ideally the contract should have getAllLoans()
  const maxLoanIdToCheck = 100;
  
  // Refetch trigger state
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  const loanIdContracts = useMemo(() => {
    if (!loanContractAddress) return [];
    // Include refetchTrigger to force re-fetch when refetch is called
    void refetchTrigger;
    
    // Check IDs from 0 to maxLoanIdToCheck
    return Array.from({ length: maxLoanIdToCheck }, (_, i) => ({
      address: loanContractAddress,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'getLoan' as const,
      args: [BigInt(i)],
    }));
  }, [loanContractAddress, refetchTrigger]);

  const { data: loansData, isLoading: isLoadingLoans, refetch: refetchContracts } = useReadContracts({
    contracts: loanIdContracts,
    query: {
      enabled: loanIdContracts.length > 0,
      refetchInterval: 10000, // Refetch every 10 seconds to catch new loans
    },
  });

  // Extract valid loan IDs from the results
  const loanIds = useMemo(() => {
    if (!loansData) return [];
    
    return loansData
      .map((result, index) => {
        if (result.status === 'success' && result.result) {
          const loan = result.result as LoanData;
          // Check if loan is active and exists
          if (loan.isActive && loan.loanId === BigInt(index)) {
            return BigInt(index);
          }
        }
        return null;
      })
      .filter((id): id is bigint => id !== null);
  }, [loansData]);

  // Fetch funding progress for each loan
  const fundingContracts = useMemo(() => {
    if (!loanIds || loanIds.length === 0 || !loanContractAddress) return [];
    
    return loanIds.map((loanId) => ({
      address: loanContractAddress,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'getLoanFundingProgress' as const,
      args: [loanId],
    }));
  }, [loanIds, loanContractAddress]);

  const { data: fundingData } = useReadContracts({
    contracts: fundingContracts,
    query: {
      enabled: fundingContracts.length > 0,
    },
  });

  // Transform loan data
  const baseLoans: Loan[] = useMemo(() => {
    if (!loansData || loanIds.length === 0) return [];

    return loansData
      .map((result, index) => {
        // Only process if this index corresponds to a valid loan ID
        const loanId = BigInt(index);
        if (!loanIds.includes(loanId)) return null;
        
        if (result.status !== 'success' || !result.result) return null;
        
        const data = result.result as LoanData;
        
        // Verify this is the correct loan
        if (data.loanId !== loanId || !data.isActive) return null;
        
        // Get funding progress
        const fundingIndex = loanIds.indexOf(loanId);
        const fundingResult = fundingData?.[fundingIndex];
        let fundedAmount = Number(data.fundedAmount) / 1e6;
        let fundedPercentage = 0;
        
        if (fundingResult?.status === 'success' && fundingResult.result) {
          const [fundedAmt, loanAmt, fundingPctBasis, isFunded] = fundingResult.result as [bigint, bigint, bigint, boolean];
          fundedAmount = Number(fundedAmt) / 1e6;
          // fundingPctBasis is in basis points (0-10000), convert to percentage (0-100)
          fundedPercentage = Number(fundingPctBasis) / 100;
        } else {
          // Calculate from loan data
          const loanAmt = Number(data.loanAmount) / 1e6;
          fundedPercentage = loanAmt > 0 ? (fundedAmount / loanAmt) * 100 : 0;
        }

        // Convert bigint values to numbers
        const loanAmount = Number(data.loanAmount) / 1e6;
        const duration = Number(data.duration);
        const interestRate = Number(data.interestRate) / 100; // Convert from basis points to percentage
        const createdAt = Number(data.createdAt);
        const fundedAt = Number(data.fundedAt);
        const monthlyPayment = Number(data.monthlyPayment) / 1e6;
        const totalOwed = Number(data.totalOwed) / 1e6;
        const amountPaid = Number(data.amountPaid) / 1e6;
        const nextPaymentDue = Number(data.nextPaymentDue);
        const status = getLoanStatusString(data.status);

        const loan: Loan = {
          loanId: loanId.toString(),
          borrower: String(data.borrower),
          propertyTokenId: data.propertyTokenId.toString(),
          loanAmount,
          duration,
          interestRate,
          fundedAmount,
          fundedPercentage: Math.round(fundedPercentage),
          status,
          createdAt,
          fundedAt,
          monthlyPayment,
          totalOwed,
          amountPaid,
          nextPaymentDue,
          isActive: data.isActive,
        };
        return loan;
      })
      .filter((l): l is Loan => l !== null && l !== undefined);
  }, [loansData, loanIds, fundingData]);

  // Filter to only show OPEN loans for investors
  const availableLoans = useMemo(() => {
    return baseLoans.filter(loan => loan.status === 'OPEN' || loan.status === 'PENDING');
  }, [baseLoans]);

  const isLoading = isLoadingLoans;
  const error = undefined; // Could add error handling if needed

  // Refetch function - trigger a re-read of contracts
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
    refetchContracts();
  };

  return {
    loans: availableLoans,
    allLoans: baseLoans, // Include all loans for reference
    isLoading,
    error,
    refetch,
    loanContractAddress,
  };
};

/**
 * Hook to get user's loans (for borrowers)
 */
export const useUserLoans = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const loanContractAddress = getLoanContractAddress(chainId);
  const propertyTokenAddress = getPropertyTokenAddress(chainId);

  // Get user's loan IDs using getBorrowerLoans (matches contract)
  const { data: loanIds, isLoading: isLoadingLoanIds, error: loanIdsError, refetch: refetchLoanIds } = useReadContract({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'getBorrowerLoans',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!loanContractAddress,
      refetchInterval: false,
    },
  });

  // Fetch loan data for each loan ID
  const contracts = useMemo(() => {
    if (!loanIds || loanIds.length === 0 || !loanContractAddress) return [];
    
    return loanIds.map((loanId) => ({
      address: loanContractAddress,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'getLoan' as const,
      args: [loanId],
    }));
  }, [loanIds, loanContractAddress]);

  const { data: loansData, isLoading: isLoadingLoans } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  // Fetch funding progress for each loan
  const fundingContracts = useMemo(() => {
    if (!loanIds || loanIds.length === 0 || !loanContractAddress) return [];
    
    return loanIds.map((loanId) => ({
      address: loanContractAddress,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'getLoanFundingProgress' as const,
      args: [loanId],
    }));
  }, [loanIds, loanContractAddress]);

  const { data: fundingData } = useReadContracts({
    contracts: fundingContracts,
    query: {
      enabled: fundingContracts.length > 0,
    },
  });

  // Fetch property data for each loan
  const propertyContracts = useMemo(() => {
    if (!loansData || !propertyTokenAddress) return [];
    
    return loansData
      .map((result) => {
        if (result.status !== 'success' || !result.result) return null;
        const data = result.result as LoanData;
        return {
          address: propertyTokenAddress,
          abi: PROPERTY_TOKEN_ABI,
          functionName: 'getPropertyData' as const,
          args: [data.propertyTokenId],
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [loansData, propertyTokenAddress]);

  const { data: propertiesData } = useReadContracts({
    contracts: propertyContracts,
    query: {
      enabled: propertyContracts.length > 0,
    },
  });

  // Transform loan data with property information
  const loans: Loan[] = useMemo(() => {
    if (!loansData || !loanIds || loanIds.length === 0) return [];

    return loansData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null;
        
        const data = result.result as LoanData;
        const loanId = loanIds[index];
        
        // Get funding progress
        const fundingResult = fundingData?.[index];
        let fundedAmount = Number(data.fundedAmount) / 1e6;
        let fundedPercentage = 0;
        
        if (fundingResult?.status === 'success' && fundingResult.result) {
          const [fundedAmt, loanAmt, fundingPctBasis, isFunded] = fundingResult.result as [bigint, bigint, bigint, boolean];
          fundedAmount = Number(fundedAmt) / 1e6;
          // fundingPctBasis is in basis points (0-10000), convert to percentage (0-100)
          fundedPercentage = Number(fundingPctBasis) / 100;
        } else {
          const loanAmt = Number(data.loanAmount) / 1e6;
          fundedPercentage = loanAmt > 0 ? (fundedAmount / loanAmt) * 100 : 0;
        }

        // Get property data
        const propertyResult = propertiesData?.[index];
        let propertyValue: number | undefined;
        let collateralType: string | undefined;
        let tokenizedPortion: number | undefined;
        let tokenizedValue: number | undefined;

        if (propertyResult?.status === 'success' && propertyResult.result) {
          const propData = propertyResult.result as {
            valuation: bigint;
            tokenizedPortion: bigint;
            tokenizedValue: bigint;
            collateralType: string;
            metadataURI: string;
          };
          propertyValue = Number(propData.valuation) / 1e6;
          tokenizedPortion = Number(propData.tokenizedPortion);
          tokenizedValue = Number(propData.tokenizedValue) / 1e6;
          collateralType = propData.collateralType;
        }

        // Convert bigint values to numbers
        const loanAmount = Number(data.loanAmount) / 1e6;
        const duration = Number(data.duration);
        const interestRate = Number(data.interestRate) / 100;
        const createdAt = Number(data.createdAt);
        const fundedAt = Number(data.fundedAt);
        const monthlyPayment = Number(data.monthlyPayment) / 1e6;
        const totalOwed = Number(data.totalOwed) / 1e6;
        const amountPaid = Number(data.amountPaid) / 1e6;
        const nextPaymentDue = Number(data.nextPaymentDue);
        const status = getLoanStatusString(data.status);

        const loan: Loan = {
          loanId: loanId.toString(),
          borrower: String(data.borrower),
          propertyTokenId: data.propertyTokenId.toString(),
          loanAmount,
          duration,
          interestRate,
          fundedAmount,
          fundedPercentage: Math.round(fundedPercentage),
          status,
          createdAt,
          fundedAt,
          monthlyPayment,
          totalOwed,
          amountPaid,
          nextPaymentDue,
          isActive: data.isActive,
          propertyValue,
          collateralType,
          tokenizedPortion,
          tokenizedValue,
        };
        return loan;
      })
      .filter((l): l is Loan => l !== null && l !== undefined);
  }, [loansData, loanIds, fundingData, propertiesData]);

  const isLoading = isLoadingLoanIds || isLoadingLoans;
  const error = loanIdsError;

  return {
    loans,
    isLoading,
    error,
    refetch: refetchLoanIds,
    loanContractAddress,
  };
};

