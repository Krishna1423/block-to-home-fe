import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LoanCard from "@/components/LoanCard";
import { useUserProperties } from "@/hooks/useUserProperties";
import { useAccount, useChainId } from "wagmi";
import { getPropertyTokenAddress } from "@/lib/propertyToken";
import {
  Building,
  Briefcase,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Wallet,
  Landmark,
  Plus,
  TrendingUp,
  Loader2,
} from "lucide-react";

// Mock data for loans and investments (will be replaced when loan contracts are implemented)
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

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getPropertyTokenAddress(chainId);
  const { properties, isLoading: isLoadingProperties, error: propertiesError } = useUserProperties();

  // Calculate statistics from real property data
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, prop) => {
      // Remove commas and parse value
      const value = parseFloat(prop.value.replace(/,/g, ''));
      return sum + value;
    }, 0);
    const totalTokenizedValue = properties.reduce((sum, prop) => {
      const value = parseFloat(prop.tokenizedValue.replace(/,/g, ''));
      return sum + value;
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
                <div className="text-3xl font-bold mb-1">1</div>
                <div className="text-sm text-gray-500">
                  Total Debt: 70,000 USDT
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
                <div className="text-3xl font-bold mb-1">2</div>
                <div className="text-sm text-gray-500">
                  Total Invested: 10,000 USDT
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
                <div className="text-3xl font-bold mb-1">42 USDT</div>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+5% this month</span>
                </div>
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
                <Link to="/tokenize">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
              </div>

              {isLoadingProperties ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-bcms-blue-light mb-4" />
                  <p className="text-gray-600">Loading your properties...</p>
                </div>
              ) : propertiesError ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                  <p className="text-red-600 mb-2">Error loading properties</p>
                  <p className="text-sm text-gray-600">{propertiesError.message}</p>
                </div>
              ) : properties.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard 
                      key={property.tokenId} 
                      id={property.tokenId}
                      title={property.title}
                      address={property.address}
                      value={property.value}
                      tokenizedPortion={property.tokenizedPortion}
                      tokenizedValue={property.tokenizedValue}
                      imageUrl={property.imageUrl}
                      tokenized={property.tokenized}
                      collateralType={property.collateralType}
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
                  <Button asChild>
                    <Link to="/tokenize">Tokenize Property</Link>
                  </Button>
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

              {mockLoans.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockLoans.map((loan) => (
                    <LoanCard key={loan.id} {...loan} />
                  ))}
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
                <Link to="/invest">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Find Investments
                  </Button>
                </Link>
              </div>

              {mockInvestments.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockInvestments.map((investment) => (
                    <LoanCard key={investment.id} {...investment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Investments Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start investing in mortgage loans
                  </p>
                  <Button asChild>
                    <Link to="/invest">Browse Opportunities</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
