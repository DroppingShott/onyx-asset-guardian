
import { useEffect, useState } from "react";
import { WalletProvider, useWallet } from "@/context/WalletContext";
import WalletConnect from "@/components/WalletConnect";
import Portfolio from "@/components/Portfolio";
import AssetList from "@/components/AssetList";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import AlertNotifications from "@/components/AlertNotifications";
import { Asset, fetchUserAssets } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const { isConnected, address } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const loadAssets = async () => {
      if (isConnected && address) {
        try {
          const userAssets = await fetchUserAssets(address);
          setAssets(userAssets);
        } catch (error) {
          console.error("Failed to load assets:", error);
        }
      } else {
        setAssets([]);
      }
    };

    loadAssets();
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-crypto-purple">Onyx</span>
              <span className="text-white">Guard</span>
            </h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-lg">
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8">
                Connect your MetaMask wallet to analyze your crypto assets, receive risk assessments, 
                and get real-time alerts based on market sentiment.
              </p>
              <WalletConnect className="justify-center" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Portfolio />
            
            <div className="grid gap-6 md:grid-cols-2">
              <AssetList />
              <div className="space-y-6">
                <AlertNotifications />
                <SentimentAnalysis assets={assets} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-bold">
                <span className="text-crypto-purple">Onyx</span>
                <span className="text-white">Guard</span>
              </span>
              <span className="text-muted-foreground text-sm ml-2">
                Real-time crypto sentiment analysis
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OnyxGuard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
};

export default Index;
