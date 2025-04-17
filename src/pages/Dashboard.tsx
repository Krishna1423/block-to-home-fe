import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LoanCard from "@/components/LoanCard";
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
} from "lucide-react";

// Mock data for the dashboard
const mockProperties = [
  {
    id: "RET12345",
    title: "Downtown Apartment",
    address: "123 Main St, New York",
    value: "100,000",
    tokenizedPortion: 50,
    tokenizedValue: "50,000",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    tokenized: true,
    collateralType: "USDT" as const,
  },
  {
    id: "RET12346",
    title: "Beach House",
    address: "456 Ocean Dr, Miami",
    value: "250,000",
    tokenizedPortion: 75,
    tokenizedValue: "187,500",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    tokenized: true,
    collateralType: "Gold" as const,
  },
  {
    id: "RET12347",
    title: "Luxury Flat",
    address: "78 Kensington High St, London",
    value: "850,000",
    tokenizedPortion: 60,
    tokenizedValue: "510,000",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    tokenized: true,
    collateralType: "USDT" as const,
  },
  {
    id: "RET12348",
    title: "Modern Apartment",
    address: "Sultanahmet, Istanbul",
    value: "320,000",
    tokenizedPortion: 80,
    tokenizedValue: "256,000",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    tokenized: true,
    collateralType: "Gold" as const,
  },
  {
    id: "RET12349",
    title: "Palm Jumeirah Villa",
    address: "Palm Jumeirah, Dubai",
    value: "1,200,000",
    tokenizedPortion: 40,
    tokenizedValue: "480,000",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227",
    tokenized: true,
    collateralType: "USDT" as const,
  },
  {
    id: "RET12350",
    title: "Lake View Apartment",
    address: "Seefeld, Zurich",
    value: "950,000",
    tokenizedPortion: 70,
    tokenizedValue: "665,000",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    tokenized: true,
    collateralType: "Gold" as const,
  },
  {
    id: "RET12351",
    title: "Marina Bay Condo",
    address: "Marina Bay, Singapore",
    value: "1,500,000",
    tokenizedPortion: 55,
    tokenizedValue: "825,000",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
    tokenized: true,
    collateralType: "USDT" as const,
  },
  {
    id: "RET12352",
    title: "Downtown Toronto Loft",
    address: "King West, Toronto",
    value: "750,000",
    tokenizedPortion: 65,
    tokenizedValue: "487,500",
    imageUrl: "https://images.unsplash.com/photo-1515263487990-61b07816b324",
    tokenized: true,
    collateralType: "Gold" as const,
  },
  {
    id: "RET12353",
    title: "Waterfront Condo",
    address: "False Creek, Vancouver",
    value: "1,100,000",
    tokenizedPortion: 45,
    tokenizedValue: "495,000",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    tokenized: true,
    collateralType: "USDT" as const,
  },
];

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
                <div className="text-3xl font-bold mb-1">2</div>
                <div className="text-sm text-gray-500">
                  Total Value: 350,000 USDT
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

              {mockProperties.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProperties.map((property) => (
                    <PropertyCard key={property.id} {...property} />
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
