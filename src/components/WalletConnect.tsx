
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { formatAddress } from "@/lib/api";
import { Wallet } from "lucide-react";

interface WalletConnectProps {
  className?: string;
}

const WalletConnect = ({ className = "" }: WalletConnectProps) => {
  const { isConnected, address, connectWallet, disconnectWallet, connecting, balance } = useWallet();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnected ? (
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium">{formatAddress(address)}</span>
            <span className="text-xs text-muted-foreground">{balance} ETH</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={disconnectWallet}
            className="border-crypto-blue text-crypto-blue hover:bg-crypto-blue/10"
          >
            <Wallet className="h-4 w-4 mr-2" /> Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={connectWallet} 
          disabled={connecting}
          className="bg-crypto-blue hover:bg-crypto-blue/90 text-white"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;
