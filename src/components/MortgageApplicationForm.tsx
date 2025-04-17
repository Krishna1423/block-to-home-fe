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
} from "lucide-react";
import { parseNumericString } from "@/lib/utils";

// Mock data for a tokenized property
const mockTokenizedProperty = {
  id: "RET12345",
  title: "Downtown Apartment",
  address: "123 Blockchain Street, Crypto City",
  value: "100,000",
  imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  tokenized: true,
  collateralType: "USDT" as const,
};

const MortgageApplicationForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    loanAmount: "",
    duration: "12",
    purpose: "",
  });
  const [calculated, setCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyValue = parseNumericString(mockTokenizedProperty.value);
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
    const calculatedLtv =
      (principal / parseNumericString(mockTokenizedProperty.value)) * 100;

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

  const handleSubmit = () => {
    if (!calculated) {
      toast({
        title: "Please calculate first",
        description: "You need to calculate the loan before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      toast({
        title: "Mortgage application submitted",
        description: "Your application has been sent to the investor pool",
      });
      setIsSubmitting(false);
      // Redirect to dashboard or confirmation page
      // window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Mortgage Loan Application</h2>

      {/* Tokenized Property Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Selected Tokenized Property</h3>
          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Verified
          </div>
        </div>

        <div className="flex items-start gap-4">
          <img
            src={mockTokenizedProperty.imageUrl}
            alt={mockTokenizedProperty.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-medium">{mockTokenizedProperty.title}</h4>
            <p className="text-sm text-gray-600">
              {mockTokenizedProperty.address}
            </p>
            <div className="flex items-center mt-1">
              <div className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center">
                Token ID: {mockTokenizedProperty.id}
              </div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                {mockTokenizedProperty.collateralType}-backed
              </div>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Property Value</div>
            <div className="font-bold">{mockTokenizedProperty.value} USDT</div>
          </div>
        </div>
      </div>

      {/* Loan Information Form */}
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
          />
        </div>
      </div>

      <Button onClick={calculateLoan} className="w-full mb-8">
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
            disabled={isSubmitting}
            className="w-full bg-bcms-blue hover:bg-bcms-blue/90"
          >
            {isSubmitting ? "Processing..." : "Submit Mortgage Application"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MortgageApplicationForm;
