import React from "react";
import { Building, MapPin, DollarSign, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNFTInstanceUrl } from "@/lib/blockchainExplorer";
import { getPropertyTokenAddress } from "@/lib/contracts";

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  value: string;
  tokenizedPortion?: number;
  tokenizedValue?: string;
  imageUrl: string;
  tokenized: boolean;
  collateralType: "Gold" | "USDT";
  onClick?: () => void;
  className?: string;
  chainId?: number;
  contractAddress?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  address,
  value,
  tokenizedPortion,
  tokenizedValue,
  imageUrl,
  tokenized,
  collateralType,
  onClick,
  className,
  chainId,
  contractAddress,
}) => {
  const handleViewDetails = () => {
    if (onClick) {
      onClick();
      return;
    }

    // If tokenized and we have chainId and contractAddress, navigate to explorer
    if (tokenized && chainId && contractAddress) {
      const explorerUrl = getNFTInstanceUrl(chainId, contractAddress, id);
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div
      className={cn(
        "bg-white rounded-lg overflow-hidden card-shadow",
        className
      )}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {tokenized && (
          <div className="absolute top-3 right-3 bg-bcms-blue-light text-white text-xs py-1 px-3 rounded-full">
            Tokenized
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{address}</span>
        </div>
        <div className="flex items-center text-gray-800 font-medium mb-4">
          <DollarSign size={16} className="mr-1" />
          <span>{value} USD</span>
        </div>

        {tokenized && tokenizedPortion && tokenizedValue && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tokenized Portion:</span>
              <span className="font-medium">{tokenizedPortion}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tokenized Value:</span>
              <span className="font-medium">{tokenizedValue} USD</span>
            </div>
          </div>
        )}

        {tokenized && (
          <div className="flex items-center mb-4">
            <div className="text-xs bg-gray-100 py-1 px-2 rounded flex items-center">
              <Building size={14} className="mr-1" />
              <span>Token ID: {id}</span>
            </div>
            <div
              className={cn(
                "text-xs py-1 px-2 rounded ml-2",
                collateralType === "Gold"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              )}
            >
              {collateralType}-backed
            </div>
          </div>
        )}

        <Button
          onClick={handleViewDetails}
          className="w-full bg-bcms-blue hover:bg-bcms-blue/90"
        >
          {tokenized ? "View Details" : "Tokenize Property"}
        </Button>
      </div>
    </div>
  );
};

export default PropertyCard;
