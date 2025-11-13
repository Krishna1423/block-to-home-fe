import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useAccount, useDisconnect, useConnect, useConnectors } from "wagmi";
import { useUSDTBalance } from "@/hooks/useUSDTBalance";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  balance: string;
  setBalance: (newBalance: string) => void; // Kept for backward compatibility
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  chainId?: number;
  connector?: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address, isConnected, chainId, connector } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const connectors = useConnectors();
  const { connect: connectWallet, isPending: isConnecting } = useConnect();
  const { formattedBalance, symbol, isLoading: isBalanceLoading } = useUSDTBalance();

  // Format wallet address for display (truncate middle)
  const displayAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Format balance for display
  const displayBalance = useMemo(() => {
    if (isBalanceLoading) return "Loading...";
    if (!formattedBalance || formattedBalance === "0") return "0";
    // Format with commas
    const [whole, decimal] = formattedBalance.split(".");
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  }, [formattedBalance, isBalanceLoading]);

  const connect = () => {
    // Try to connect with MetaMask first, then fallback to first available connector
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    const connectorToUse = metaMaskConnector || connectors[0];
    
    if (connectorToUse) {
      connectWallet({ connector: connectorToUse });
    }
  };

  const disconnect = () => {
    disconnectWallet();
  };

  // Backward compatibility: setBalance is a no-op since balance comes from blockchain
  const setBalance = (_newBalance: string) => {
    // Balance is read from blockchain, so this is a no-op
    // Kept for backward compatibility with existing code
    console.warn("setBalance is deprecated. Balance is read from blockchain.");
  };

  const value = useMemo(
    () => ({
      isConnected: isConnected && !!address,
      walletAddress: address || "",
      balance: `${displayBalance} ${symbol}`,
      setBalance,
      connect,
      disconnect,
      isConnecting,
      chainId,
      connector,
    }),
    [
      isConnected,
      address,
      displayBalance,
      symbol,
      isConnecting,
      chainId,
      connector,
      connect,
      disconnect,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
