
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connecting: boolean;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    // Check if MetaMask is installed
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            const balanceHex = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest'],
            });
            const balanceWei = parseInt(balanceHex, 16);
            const balanceEth = balanceWei / 10**18;
            setBalance(balanceEth.toFixed(4));
          }
        } catch (error) {
          console.error("Error checking MetaMask connection", error);
        }
      }
    };

    checkConnection();

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress(null);
        setBalance('0');
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Clean up
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask extension to connect your wallet."
      });
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setIsConnected(true);
      
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 10**18;
      setBalance(balanceEth.toFixed(4));

      toast.success("Wallet connected", {
        description: `Connected with address ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`
      });
    } catch (error: any) {
      console.error("Error connecting wallet", error);
      toast.error("Connection failed", {
        description: error.message || "Failed to connect to MetaMask"
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connecting,
        balance,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
