import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { parseNumericString } from "@/lib/utils";
import { useUserProperties, Property } from "@/hooks/useUserProperties";
import { useWallet } from "@/contexts/WalletContext";
import { useCreateLoan } from "@/hooks/useCreateLoan";
import { useUserLoans } from "@/hooks/useLoans";
import { useNavigate } from "react-router-dom";

const MortgageApplicationForm: React.FC = () => {
  const { toast } = useToast();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const { properties, isLoading: isLoadingProperties, hasProperties } = useUserProperties();
  const { createLoan, isPending: isCreatingLoan, isSuccess: isLoanCreated, hash } = useCreateLoan();
  const { refetch: refetchUserLoans } = useUserLoans();
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    loanAmount: "",
    duration: "12",
    purpose: "",
  });
  const [calculated, setCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set first property as default when properties load
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);

  // Update max loan amount when property changes
  const propertyValue = selectedProperty ? selectedProperty.tokenizedValue : 0;
  const maxLoanAmount = propertyValue * 0.7;

  // Derived values
  const [interestRate, setInterestRate] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);
  const [ltv, setLtv] = useState(0);

  useEffect(() => {
    // Reset calculation when form changes
    setCalculated(false);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "loanAmount") {
      // Don't allow values over max loan amount
      const numValue = parseNumericString(value);
      if (numValue > maxLoanAmount) {
        toast({
          title: "Loan amount too high",
          description: `Maximum loan amount is ${maxLoanAmount.toLocaleString()} USDT (70% of property value)`,
          variant: "destructive",
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDurationChange = (value: string) => {
    setFormData({
      ...formData,
      duration: value,
    });
  };

  const calculateLoan = () => {
    if (!formData.loanAmount) {
      toast({
        title: "Missing information",
        description: "Please enter a loan amount",
        variant: "destructive",
      });
      return;
    }

    // Calculate loan metrics
    const principal = parseNumericString(formData.loanAmount);
    const months = parseInt(formData.duration);
    const monthlyRate = interestRate / 100 / 12;

    // Monthly payment formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPaid = payment * months;
    const totalInterestPaid = totalPaid - principal;
    const calculatedLtv = propertyValue > 0
      ? (principal / propertyValue) * 100
      : 0;

    setMonthlyPayment(payment);
    setTotalRepayment(totalPaid);
    setTotalInterest(totalInterestPaid);
    setLtv(calculatedLtv);
    setCalculated(true);

    toast({
      title: "Loan calculated",
      description: "See your payment schedule below",
    });
  };

  const handleSubmit = async () => {
    if (!calculated) {
      toast({
        title: "Please calculate first",
        description: "You need to calculate the loan before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProperty) {
      toast({
        title: "Property not selected",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the contract to create loan request
      await createLoan({
        propertyTokenId: selectedProperty.tokenId,
        loanAmount: formData.loanAmount,
        interestRate: interestRate,
        duration: parseInt(formData.duration),
      });
    } catch (error) {
      console.error('Error submitting loan:', error);
      setIsSubmitting(false);
    }
  };

  // Handle successful loan creation
  React.useEffect(() => {
    if (isLoanCreated && hash) {
      setIsSubmitting(false);
      // Refetch user loans to show the new loan
      refetchUserLoans();
      // Optionally redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [isLoanCreated, hash, refetchUserLoans, navigate]);

  // Handle property selection
  const handlePropertyChange = (tokenId: string) => {
    const property = properties.find((p) => p.tokenId === tokenId);
    if (property) {
      setSelectedProperty(property);
      setCalculated(false); // Reset calculation when property changes
    }
  };

  // Show loading state
  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Mortgage Loan Application</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Please connect your wallet to view your properties</p>
        </div>
      </div>
    );
  }

  if (isLoadingProperties) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Mortgage Loan Application</h2>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-bcms-blue" />
          <p className="text-gray-500">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (!hasProperties) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Mortgage Loan Application</h2>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
          <p className="text-gray-500 mb-2">No tokenized properties found</p>
          <p className="text-sm text-gray-400 mb-4">
            You need to tokenize a property before applying for a loan
          </p>
          <Button
            onClick={() => (window.location.href = '/tokenize-property')}
            variant="outline"
          >
            Tokenize Property
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Mortgage Loan Application</h2>

      {/* Property Selection */}
      <div className="mb-6">
        <Label htmlFor="propertySelect">Select Property</Label>
        <Select
          value={selectedProperty?.tokenId || ""}
          onValueChange={handlePropertyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a property">
              {selectedProperty
                ? `${selectedProperty.title} (Token ID: ${selectedProperty.tokenId})`
                : "Select a property"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.tokenId} value={property.tokenId}>
                {property.title} - {property.tokenizedValue.toLocaleString()} USDT
                {!property.isActive && " (Inactive)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {properties.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No properties available. Tokenize a property first.
          </p>
        )}
      </div>

      {/* Tokenized Property Information */}
      {selectedProperty && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Selected Tokenized Property</h3>
            <div className="flex items-center gap-2">
              {selectedProperty.isActive ? (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Verified
                </div>
              ) : (
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Inactive
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <img
              src={selectedProperty.imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"}
              alt={selectedProperty.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium">{selectedProperty.title}</h4>
              <p className="text-sm text-gray-600">
                {selectedProperty.address || "Address not available"}
              </p>
              <div className="flex items-center mt-1">
                <div className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center">
                  Token ID: {selectedProperty.tokenId}
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                  {selectedProperty.collateralType}-backed
                </div>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Tokenized Value</div>
              <div className="font-bold">
                {selectedProperty.tokenizedValue.toLocaleString()} USDT
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedProperty.tokenizedPortion}% of {selectedProperty.valuation.toLocaleString()} USDT
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedProperty && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Please select a property to continue with your loan application
            </p>
          </div>
        </div>
      )}

      {/* Loan Information Form */}
      {selectedProperty && (
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="loanAmount">
              Requested Loan Amount (max {maxLoanAmount.toLocaleString()} USDT)
            </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="loanAmount"
              name="loanAmount"
              type="number"
              className="pl-10"
              placeholder="Enter loan amount"
              value={formData.loanAmount}
              onChange={handleChange}
              disabled={!selectedProperty}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Maximum loan-to-value: 70%
          </div>
        </div>

          <div>
            <Label htmlFor="duration">Loan Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={handleDurationChange}
              disabled={!selectedProperty}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
                <SelectItem value="60">60 months</SelectItem>
                <SelectItem value="120">120 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="purpose">Loan Purpose</Label>
            <Input
              id="purpose"
              name="purpose"
              placeholder="Briefly describe your loan purpose"
              value={formData.purpose}
              onChange={handleChange}
              disabled={!selectedProperty}
            />
          </div>
        </div>
      )}

      <Button 
        onClick={calculateLoan} 
        className="w-full mb-8"
        disabled={!selectedProperty || !selectedProperty.isActive}
      >
        Calculate Loan
      </Button>

      {/* Loan Calculation Results */}
      {calculated && (
        <div className="mb-8">
          <h3 className="font-medium mb-4">Payment Schedule</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-gray-500 text-sm">Interest Rate</div>
                <div className="text-xl font-bold">{interestRate}%</div>
                <div className="text-xs text-gray-500">Annual</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-gray-500 text-sm">Monthly Payment</div>
                <div className="text-xl font-bold">
                  {monthlyPayment.toFixed(2)} USDT
                </div>
                <div className="text-xs text-gray-500">
                  For {formData.duration} months
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-gray-500 text-sm">Total Interest</div>
                <div className="text-xl font-bold">
                  {totalInterest.toFixed(2)} USDT
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-gray-500 text-sm">Total Repayment</div>
                <div className="text-xl font-bold">
                  {totalRepayment.toFixed(2)} USDT
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-lg flex items-center gap-3 mb-6">
            {ltv > 70 ? (
              <>
                <AlertTriangle className="text-amber-500" />
                <div>
                  <p className="font-medium">LTV Ratio: {ltv.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">
                    Your loan-to-value ratio exceeds our recommended limit.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="text-green-500" />
                <div>
                  <p className="font-medium">LTV Ratio: {ltv.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">
                    Your loan-to-value ratio is within acceptable limits.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center p-4 bg-bcms-blue-light/10 rounded-lg mb-6">
            <Calendar className="mr-3 text-bcms-blue-light" />
            <div>
              <p className="font-medium">
                First Payment Due:{" "}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Monthly payments on the same date thereafter
              </p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isCreatingLoan}
            className="w-full bg-bcms-blue hover:bg-bcms-blue/90"
          >
            {isSubmitting || isCreatingLoan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreatingLoan ? "Creating loan on blockchain..." : "Processing..."}
              </>
            ) : (
              <>
                Submit Mortgage Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          {hash && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Transaction submitted:</strong> {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Waiting for confirmation...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MortgageApplicationForm;
