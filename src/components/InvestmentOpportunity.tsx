import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  Building,
  Shield,
  PieChart,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { parseNumericString } from "@/lib/utils";

interface InvestmentOpportunityProps {
  loanId: string;
  borrower: string;
  amount: string;
  funded: number;
  interestRate: string;
  duration: string;
  propertyValue: string;
  collateralType: "Gold" | "USDT";
  startDate: string;
  endDate: string;
  propertyImageUrl: string;
  propertyAddress: string;
}

const InvestmentOpportunity: React.FC<InvestmentOpportunityProps> = ({
  loanId,
  borrower,
  amount,
  funded,
  interestRate,
  duration,
  propertyValue,
  collateralType,
  startDate,
  endDate,
  propertyImageUrl,
  propertyAddress,
}) => {
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [sliderValue, setSliderValue] = useState(20);
  const [isInvesting, setIsInvesting] = useState(false);

  const amountRemaining = (parseNumericString(amount) * (100 - funded)) / 100;
  const maxInvestment = Math.min(amountRemaining, 10000); // Cap at 10,000 USDT or remaining amount
  const expectedReturn = (
    ((investmentAmount * parseNumericString(interestRate)) / 100) *
    (parseNumericString(duration) / 12)
  ).toFixed(2);
  const monthlyReturn = (
    (investmentAmount * parseNumericString(interestRate)) /
    100 /
    12
  ).toFixed(2);

  const handleSliderChange = (value: number[]) => {
    const sliderVal = value[0];
    setSliderValue(sliderVal);
    const amount = Math.round((maxInvestment * sliderVal) / 100 / 10) * 10; // Round to nearest 10
    setInvestmentAmount(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setInvestmentAmount(0);
      setSliderValue(0);
      return;
    }

    if (value > maxInvestment) {
      toast({
        title: "Maximum investment exceeded",
        description: `The maximum investment amount is ${maxInvestment.toLocaleString()} USDT`,
        variant: "destructive",
      });
      setInvestmentAmount(maxInvestment);
      setSliderValue(100);
      return;
    }

    setInvestmentAmount(value);
    setSliderValue((value / maxInvestment) * 100);
  };

  const handleInvest = () => {
    if (investmentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      });
      return;
    }

    setIsInvesting(true);

    // Simulate investment process
    setTimeout(() => {
      toast({
        title: "Investment Successful",
        description: `You have invested ${investmentAmount.toLocaleString()} USDT in loan #${loanId}`,
      });
      setIsInvesting(false);
      // Redirect or update UI
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Loan Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Loan #{loanId}</h2>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            OPEN
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-gray-500 text-xs mb-1">Borrower</div>
            <div className="font-medium">{borrower}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Loan Amount</div>
            <div className="font-bold text-lg">
              {parseInt(amount).toLocaleString()} USDT
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Interest Rate</div>
            <div className="font-bold text-lg text-bcms-blue-light">
              {interestRate}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Duration</div>
            <div className="font-medium">{duration}</div>
          </div>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <PieChart className="h-4 w-4 mr-1 text-bcms-blue-light" />
            <span className="font-medium">Funding Progress</span>
          </div>
          <span className="font-medium">{funded}%</span>
        </div>
        <Progress value={funded} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            Funded: {((parseInt(amount) * funded) / 100).toLocaleString()} USDT
          </span>
          <span>Remaining: {amountRemaining.toLocaleString()} USDT</span>
        </div>
      </div>

      {/* Investment Tabs */}
      <div className="p-6">
        <Tabs defaultValue="invest">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="invest">Invest</TabsTrigger>
            <TabsTrigger value="details">Loan Details</TabsTrigger>
          </TabsList>

          {/* Investment Tab */}
          <TabsContent value="invest">
            <div className="space-y-6">
              <div>
                <label className="font-medium mb-2 block">
                  Investment Amount (USDT)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    className="pl-10"
                    value={investmentAmount}
                    onChange={handleInputChange}
                    min={0}
                    max={maxInvestment}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">0 USDT</span>
                  <span className="text-sm text-gray-600">
                    {maxInvestment.toLocaleString()} USDT
                  </span>
                </div>
                <Slider
                  value={[sliderValue]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Min</span>
                  <span>Max: {maxInvestment.toLocaleString()} USDT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        Expected Return
                      </span>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-xl font-bold">
                      {expectedReturn} USDT
                    </div>
                    <div className="text-xs text-gray-500">Over {duration}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        Monthly Income
                      </span>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-xl font-bold">
                      {monthlyReturn} USDT
                    </div>
                    <div className="text-xs text-gray-500">Per month</div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-blue-500 shrink-0 mt-1" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">
                    Important Information
                  </p>
                  <p className="text-blue-700 mt-1">
                    By investing, you are purchasing a share in this mortgage
                    loan. Returns are paid monthly as the borrower makes
                    payments. Your investment is secured by the tokenized
                    property as collateral.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleInvest}
                disabled={isInvesting || investmentAmount <= 0}
                className="w-full bg-bcms-blue hover:bg-bcms-blue/90"
              >
                {isInvesting ? "Processing..." : "Invest Now"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              {/* Property Details */}
              <div>
                <h3 className="font-medium mb-3">Property Information</h3>
                <div className="flex gap-4">
                  <img
                    src={propertyImageUrl}
                    alt="Property"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Secured by property at:
                    </div>
                    <div className="font-medium">{propertyAddress}</div>
                    <div className="flex items-center mt-2">
                      <Building className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">
                        Property Value:{" "}
                        {parseInt(propertyValue).toLocaleString()} USDT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center">
                  <Shield className="text-bcms-blue-light mr-2" />
                  <div>
                    <span className="font-medium">Collateral Type: </span>
                    <span
                      className={
                        collateralType === "Gold"
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }
                    >
                      {collateralType}-backed
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Schedule */}
              <div>
                <h3 className="font-medium mb-3">Loan Schedule</h3>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Start Date</span>
                    </div>
                    <span className="font-medium">{startDate}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>End Date</span>
                    </div>
                    <span className="font-medium">{endDate}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Annual Return</span>
                    </div>
                    <span className="font-medium">{interestRate}</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="font-medium mb-3">Risk Assessment</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-4">
                    <span>Loan-to-Value Ratio</span>
                    <span className="font-medium">
                      {(
                        (parseInt(amount) / parseInt(propertyValue)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Risk Level</span>
                      <span className="text-sm font-medium">Low</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvestmentOpportunity;
