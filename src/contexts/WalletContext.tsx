import React, { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  balance: string;
  setBalance: (newBalance: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress] = useState("0xABC...789");
  const [balance, setBalance] = useState("50,000 USDT");

  const connect = () => {
    setIsConnected(true);
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        balance,
        setBalance,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
