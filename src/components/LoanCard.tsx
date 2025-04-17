import React from "react";
import { Clock, DollarSign, Percent, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { parseNumericString } from "@/lib/utils";

interface LoanCardProps {
  id: string;
  amount: string;
  interest: string;
  duration: string;
  propertyValue: string;
  collateralType: "Gold" | "USDT";
  status: "OPEN" | "FUNDED" | "COMPLETED";
  funded?: number;
  onClick?: () => void;
  className?: string;
}

const LoanCard: React.FC<LoanCardProps> = ({
  id,
  amount,
  interest,
  duration,
  propertyValue,
  collateralType,
  status,
  funded = 0,
  onClick,
  className,
}) => {
  // Status colors
  const statusColor = {
    OPEN: "bg-green-100 text-green-800",
    FUNDED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-800",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg overflow-hidden card-shadow",
        className
      )}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold">Loan ID #{id}</h3>
          <span
            className={cn("text-xs py-1 px-2 rounded", statusColor[status])}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Amount</span>
            <div className="flex items-center font-medium">
              <DollarSign size={16} className="mr-1" />
              {amount} USDT
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Interest Rate</span>
            <div className="flex items-center font-medium">
              <Percent size={16} className="mr-1" />
              {interest}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Duration</span>
            <div className="flex items-center font-medium">
              <Clock size={16} className="mr-1" />
              {duration}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Property Value</span>
            <div className="flex items-center font-medium">
              <DollarSign size={16} className="mr-1" />
              {propertyValue} USDT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-gray-500" />
          <div
            className={cn(
              "text-xs py-1 px-2 rounded",
              collateralType === "Gold"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            )}
          >
            {collateralType}-backed
          </div>
        </div>

        {status === "OPEN" && (
          <>
            <div className="flex justify-between items-center text-sm mb-2">
              <span>Funding progress</span>
              <span className="font-medium">{funded}%</span>
            </div>
            <Progress value={funded} className="h-2 mb-4" />
          </>
        )}

        <Button
          onClick={onClick}
          className={cn(
            "w-full",
            status === "OPEN"
              ? "bg-bcms-blue hover:bg-bcms-blue/90"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          )}
          disabled={status !== "OPEN"}
        >
          {status === "OPEN" ? "Invest Now" : "View Details"}
        </Button>
      </div>
    </div>
  );
};

export default LoanCard;
