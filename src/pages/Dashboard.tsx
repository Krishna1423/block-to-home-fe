import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LoanCard from "@/components/LoanCard";
import { LoanDetailsCard } from "@/components/LoanDetailsCard";
import { useUserProperties } from "@/hooks/useUserProperties";
import { useUserLoans } from "@/hooks/useLoans";
import { useUserInvestments } from "@/hooks/useUserInvestments";
import { useInvestorLoans } from "@/hooks/useInvestorLoans";
import { usePoolWithdraw } from "@/hooks/usePoolWithdraw";
import { PoolWithdrawModal } from "@/components/PoolWithdrawModal";
import { useAccount, useChainId, useWatchContractEvent } from "wagmi";
import { getPropertyTokenAddress } from "@/lib/contracts";
import { getLoanContractAddress, LOAN_CONTRACT_ABI } from "@/lib/loanContract";
import {
  Building,
  Briefcase,
  DollarSign,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// Mock data for loans and investments (commented out - kept for reference)
/*
const mockLoans = [
  {
    id: "00123",
    amount: "70,000",
    interest: "5%",
    duration: "24 months",
    propertyValue: "100,000",
    collateralType: "USDT" as const,
    status: "FUNDED" as const,
  },
];

const mockInvestments = [
  {
    id: "00127",
    amount: "50,000",
    interest: "4.5%",
    duration: "36 months",
    propertyValue: "80,000",
    collateralType: "Gold" as const,
    status: "OPEN" as const,
    funded: 75,
  },
  {
    id: "00125",
    amount: "35,000",
    interest: "5.2%",
    duration: "12 months",
    propertyValue: "60,000",
    collateralType: "USDT" as const,
    status: "OPEN" as const,
    funded: 45,
  },
];
*/

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);
  const { properties, isLoading: isLoadingProperties, error: propertiesError, propertyTokenAddress, refetch: refetchProperties } = useUserProperties();
  const { loans: userLoans, isLoading: isLoadingLoans, error: loansError, refetch: refetchLoans } = useUserLoans();
  const { 
    totalDeposited, 
    totalReturns, 
    monthlyReturns, 
    hasInvestments,
    sharePercentage,
    isLoading: isLoadingInvestments 
  } = useUserInvestments();
  const { 
    loans: investorLoans, 
    totals: investmentTotals,
    isLoading: isLoadingInvestorLoans 
  } = useInvestorLoans();
  const { maxWithdrawable } = usePoolWithdraw();
  const loanContractAddress = getLoanContractAddress(chainId);

  // Watch for new loan creation events and refetch when detected
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanRequestCreated',
    onLogs(logs) {
      // Check if any of the new loans belong to the current user
      const userAddress = address?.toLowerCase();
      if (userAddress) {
        const userLoanCreated = logs.some(log => 
          log.args.borrower?.toLowerCase() === userAddress
        );
        if (userLoanCreated) {
          // Refetch user loans when a new one is created
          setTimeout(() => {
            refetchLoans();
          }, 2000); // Wait 2 seconds for transaction to be mined
        }
      }
    },
  });

  // Watch for payment events and refetch loans
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'PaymentMade',
    onLogs(logs) {
      // Check if payment was made for user's loan
      const userAddress = address?.toLowerCase();
      if (userAddress) {
        const userPayment = logs.some(log => 
          log.args.payer?.toLowerCase() === userAddress
        );
        if (userPayment) {
          setTimeout(() => {
            refetchLoans();
          }, 2000);
        }
      }
    },
  });

  // Watch for loan completion events
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanCompleted',
    onLogs() {
      setTimeout(() => {
        refetchLoans();
        refetchProperties(); // Property token should be released back
      }, 2000);
    },
  });

  // Watch for loan default events
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanDefaulted',
    onLogs() {
      setTimeout(() => {
        refetchLoans();
      }, 2000);
    },
  });

  // Calculate statistics from real property data
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, prop) => {
      // prop.valuation is already a number (in USDT)
      return sum + prop.valuation;
    }, 0);
    const totalTokenizedValue = properties.reduce((sum, prop) => {
      // prop.tokenizedValue is already a number (in USDT)
      return sum + prop.tokenizedValue;
    }, 0);

    return {
      totalProperties,
      totalValue,
      totalTokenizedValue,
    };
  }, [properties]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Manage your properties, loans, and investments
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Tokenized Properties</span>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-5 w-5 text-bcms-blue-light" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.totalProperties}</div>
                <div className="text-sm text-gray-500">
                  Total Value: {stats.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDT
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Active Loans</span>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-bcms-blue-light" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isLoadingLoans ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    userLoans.length
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Total Debt: {isLoadingLoans 
                    ? '...' 
                    : `${userLoans.reduce((sum, loan) => sum + loan.loanAmount, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} USDT`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Investments</span>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-bcms-blue-light" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isLoadingInvestments ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : hasInvestments ? (
                    'Active'
                  ) : (
                    '0'
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Total Invested: {isLoadingInvestments 
                    ? '...' 
                    : `${totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDT`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Returns (Monthly)</span>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-bcms-blue-light" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isLoadingInvestments ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    `${monthlyReturns.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`
                  )}
                </div>
                {totalDeposited > 0 && monthlyReturns > 0 && (
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+{((monthlyReturns / totalDeposited) * 100).toFixed(2)}% this month</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Link to="/tokenize">
              <Button
                variant="outline"
                className="w-full border-dashed h-20 hover:bg-gray-50 hover:border-bcms-blue-light hover:text-bcms-blue-light"
              >
                <div className="flex flex-col items-center justify-center">
                  <Building className="h-5 w-5 mb-2" />
                  <span>Tokenize Property</span>
                </div>
              </Button>
            </Link>

            <Link to="/mortgage">
              <Button
                variant="outline"
                className="w-full border-dashed h-20 hover:bg-gray-50 hover:border-bcms-blue-light hover:text-bcms-blue-light"
              >
                <div className="flex flex-col items-center justify-center">
                  <Briefcase className="h-5 w-5 mb-2" />
                  <span>Apply for Loan</span>
                </div>
              </Button>
            </Link>

            <Link to="/invest">
              <Button
                variant="outline"
                className="w-full border-dashed h-20 hover:bg-gray-50 hover:border-bcms-blue-light hover:text-bcms-blue-light"
              >
                <div className="flex flex-col items-center justify-center">
                  <DollarSign className="h-5 w-5 mb-2" />
                  <span>Invest in Loans</span>
                </div>
              </Button>
            </Link>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="assets" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="assets" className="px-8">
                Assets
              </TabsTrigger>
              <TabsTrigger value="loans" className="px-8">
                Loans
              </TabsTrigger>
              <TabsTrigger value="investments" className="px-8">
                Investments
              </TabsTrigger>
            </TabsList>

            {/* Assets Tab */}
            <TabsContent value="assets">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Properties</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchProperties()}
                    disabled={isLoadingProperties}
                  >
                    {isLoadingProperties ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                  <Link to="/tokenize">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Button>
                  </Link>
                </div>
              </div>

              {isLoadingProperties ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-bcms-blue-light mb-4" />
                  <p className="text-gray-600">Loading your properties...</p>
                </div>
              ) : propertiesError ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                  <p className="text-red-600 mb-2">Error loading properties</p>
                  <p className="text-sm text-gray-600 mb-2">{propertiesError.message}</p>
                  {!propertyTokenAddress && (
                    <p className="text-xs text-gray-500 mt-2">
                      PropertyToken contract address not configured for chain ID {chainId}.
                      <br />
                      Please set VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_{chainId} in your .env file.
                    </p>
                  )}
                </div>
              ) : !propertyTokenAddress ? (
                <div className="text-center py-12 bg-amber-50 rounded-lg">
                  <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Contract Not Configured</h3>
                  <p className="text-gray-600 mb-2">
                    PropertyToken contract address not set for this network.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Chain ID: {chainId}
                    <br />
                    Set VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_{chainId} in your .env file
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-gray-400 mt-2">
                      Current address: {contractAddress || 'Not set'}
                    </p>
                  )}
                </div>
              ) : properties.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard 
                      key={property.tokenId} 
                      id={property.tokenId}
                      title={property.title || `Property #${property.tokenId}`}
                      address={property.address || "Address not available"}
                      value={property.valuation.toLocaleString()}
                      tokenizedPortion={property.tokenizedPortion}
                      tokenizedValue={property.tokenizedValue.toLocaleString()}
                      imageUrl={property.imageUrl}
                      tokenized={true} // All properties from hook are tokenized
                      collateralType={property.collateralType as "USDT" | "Gold"}
                      chainId={chainId}
                      contractAddress={contractAddress}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Properties Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by tokenizing your first property
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => refetchProperties()}>
                      Refresh
                    </Button>
                    <Button asChild>
                      <Link to="/tokenize">Tokenize Property</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Loans Tab */}
            <TabsContent value="loans">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Loans</h2>
                <Link to="/mortgage">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Apply for Loan
                  </Button>
                </Link>
              </div>

              {isLoadingLoans ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-bcms-blue-light mb-4" />
                  <p className="text-gray-600">Loading your loans...</p>
                </div>
              ) : loansError ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Error Loading Loans</h3>
                  <p className="text-gray-600 mb-4">{loansError.message}</p>
                  <Button onClick={() => refetchLoans()}>Retry</Button>
                </div>
              ) : userLoans.length > 0 ? (
                <div className="space-y-6">
                  {userLoans.map((loan) => {
                    // Use LoanDetailsCard for FUNDED/ACTIVE loans (can make payments)
                    // Use LoanCard for other statuses
                    const useDetailsCard = loan.status === 'FUNDED' || loan.status === 'ACTIVE' || 
                                         loan.status === 'COMPLETED' || loan.status === 'DEFAULTED';
                    
                    if (useDetailsCard) {
                      // Fetch full loan data from contract for details card
                      return (
                        <LoanDetailsCard
                          key={loan.loanId}
                          loanId={loan.loanId}
                          loanAmount={BigInt(Math.round(loan.loanAmount * 1e6))}
                          fundedAmount={BigInt(Math.round(loan.fundedAmount * 1e6))}
                          monthlyPayment={BigInt(Math.round(loan.monthlyPayment * 1e6))}
                          totalOwed={BigInt(Math.round(loan.totalOwed * 1e6))}
                          amountPaid={BigInt(Math.round(loan.amountPaid * 1e6))}
                          interestRate={BigInt(Math.round(loan.interestRate * 100))} // Convert percentage to basis points
                          duration={BigInt(loan.duration)}
                          status={
                            loan.status === 'PENDING' ? 0 :
                            loan.status === 'OPEN' ? 1 :
                            loan.status === 'FUNDED' ? 2 :
                            loan.status === 'ACTIVE' ? 3 :
                            loan.status === 'COMPLETED' ? 4 : 5
                          }
                          createdAt={BigInt(loan.createdAt)}
                          fundedAt={BigInt(loan.fundedAt)}
                          nextPaymentDue={BigInt(loan.nextPaymentDue)}
                          borrower={loan.borrower}
                          propertyValue={loan.propertyValue}
                          propertyAddress={loan.propertyAddress}
                          collateralType={loan.collateralType}
                          onPaymentSuccess={() => {
                            refetchLoans();
                          }}
                        />
                      );
                    }
                    
                    return (
                      <LoanCard 
                        key={loan.loanId} 
                        id={loan.loanId}
                        amount={loan.loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        interest={`${loan.interestRate.toFixed(1)}%`}
                        duration={`${loan.duration} month${loan.duration > 1 ? 's' : ''}`}
                        propertyValue={loan.propertyValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'}
                        collateralType={(loan.collateralType?.toUpperCase() === 'GOLD' ? 'Gold' : 'USDT') as 'USDT' | 'Gold'}
                        status={loan.status}
                        funded={loan.status === 'OPEN' || loan.status === 'PENDING' ? loan.fundedPercentage : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
                  <p className="text-gray-600 mb-4">
                    Apply for a mortgage loan against your tokenized property
                  </p>
                  <Button asChild>
                    <Link to="/mortgage">Apply Now</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Investments Tab */}
            <TabsContent value="investments">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Investments</h2>
                <div className="flex gap-2">
                  {hasInvestments && (
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawModal(true)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  )}
                  <Link to="/invest">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Find Investments
                    </Button>
                  </Link>
                </div>
              </div>

              {isLoadingInvestorLoans ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-bcms-blue-light mb-4" />
                  <p className="text-gray-600">Loading your investments...</p>
                </div>
              ) : !hasInvestments ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Investments Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Deposit to the liquidity pool to start earning returns from loans
                  </p>
                  <Button asChild>
                    <Link to="/invest">Browse Opportunities</Link>
                  </Button>
                </div>
              ) : investorLoans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Active Loans Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your pool deposits are ready, but no loans are currently in FUNDED, ACTIVE, or COMPLETED status.
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">
                      Total Deposited: ${totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 2 })} | 
                      Share: {sharePercentage.toFixed(4)}% | 
                      Returns: ${totalReturns.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setShowWithdrawModal(true)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                    <Button asChild>
                      <Link to="/invest">Browse Opportunities</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pool Summary Card - Always show if user has investments */}
                  {hasInvestments && (
                    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Liquidity Pool Investment</h3>
                            <p className="text-sm text-gray-600">
                              Your share: {sharePercentage.toFixed(4)}% of the pool
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowWithdrawModal(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Withdraw
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Total Deposited</div>
                            <div className="text-xl font-bold">
                              ${totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Returns Earned</div>
                            <div className="text-xl font-bold text-green-600">
                              ${totalReturns.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Total Value</div>
                            <div className="text-xl font-bold">
                              ${(totalDeposited + totalReturns).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Available to Withdraw</div>
                            <div className="text-xl font-bold text-blue-600">
                              ${maxWithdrawable.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Investment Summary - Only show if there are loans */}
                  {investorLoans.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500 mb-1">Total Exposure</div>
                            <div className="text-2xl font-bold">
                              ${investmentTotals.totalExposure.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500 mb-1">Returns Received</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${investmentTotals.totalReturnsReceived.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500 mb-1">Active Loans</div>
                            <div className="text-2xl font-bold">
                              {investmentTotals.activeLoans} / {investorLoans.length}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Investment List */}
                      <div className="space-y-4">
                        {investorLoans.map((loan) => (
                          <Card key={loan.loanId}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold mb-1">Loan #{loan.loanId}</h3>
                                  <p className="text-sm text-gray-500">
                                    {loan.propertyAddress || 'Property address not available'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    loan.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {loan.status}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <div className="text-sm text-gray-500">Your Share</div>
                                  <div className="text-lg font-semibold">
                                    ${loan.investorShareOfLoan.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Interest Rate</div>
                                  <div className="text-lg font-semibold">
                                    {(loan.interestRate / 100).toFixed(2)}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Returns Received</div>
                                  <div className="text-lg font-semibold text-green-600">
                                    ${loan.investorInterestReceived.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Progress</div>
                                  <div className="text-lg font-semibold">
                                    {loan.paymentProgress.toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              {loan.isActive && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Next Payment Due:</span>
                                    <span>
                                      {loan.nextPaymentDue 
                                        ? new Date(loan.nextPaymentDue * 1000).toLocaleDateString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Withdraw Modal */}
      <PoolWithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
      />
    </div>
  );
};

export default Dashboard;
