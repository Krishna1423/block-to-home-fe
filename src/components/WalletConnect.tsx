import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Wallet, ChevronDown, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import MetaMaskLogo from "@/assets/metamask-fox.svg";

const WalletConnect: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isConnected, walletAddress, balance, connect, disconnect } =
    useWallet();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnect = () => {
    // Simulate connecting to MetaMask
    toast({
      title: "Connecting to MetaMask",
      description: "Please approve the connection request in your wallet.",
    });

    // Simulate a delay for connection
    setTimeout(() => {
      connect();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    });
  };

  const handleCopy = () => {
    // Simulate copy to clipboard
    navigator.clipboard.writeText(walletAddress).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isConnected) {
    return (
      <Button
        className="bg-naples-yellow text-black hover:bg-white hover:text-black"
        onClick={handleConnect}
      >
        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-naples-yellow text-black px-4 py-2 rounded-md cursor-pointer">
          <img src={MetaMaskLogo} alt="MetaMask" className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 text-white hover:text-gray-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-sm font-medium">{balance}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white shadow-lg rounded-md p-3">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <span className="text-sm font-medium">
                  Connected with MetaMask
                </span>
                <img src={MetaMaskLogo} alt="MetaMask" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Balance
                </span>
                <span className="text-sm font-medium">{balance}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Address
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{walletAddress}</span>
                  <button
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium py-2 border-t border-gray-200"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
