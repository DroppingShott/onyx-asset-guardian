
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, fetchUserAssets, formatNumber } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const AssetList = () => {
  const { address, isConnected } = useWallet();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadAssets = async () => {
      if (isConnected && address) {
        setLoading(true);
        try {
          const userAssets = await fetchUserAssets(address);
          setAssets(userAssets);
        } catch (error) {
          console.error("Failed to load assets:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setAssets([]);
      }
    };

    loadAssets();
  }, [isConnected, address]);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Your Assets</CardTitle>
        <div className="text-sm font-medium">
          Total Value: {formatNumber(totalValue)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-2 py-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-6">Asset</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Value</div>
            </div>
            
            <div className="space-y-1">
              {filteredAssets.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchTerm ? "No assets found matching your search" : "No assets found in your wallet"}
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="grid grid-cols-12 gap-4 rounded-md p-2 hover:bg-muted/50"
                  >
                    <div className="col-span-6 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img 
                          src={asset.image} 
                          alt={asset.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span>{asset.amount}</span>
                    </div>
                    <div className="col-span-2 flex flex-col items-end justify-center">
                      <div className="font-medium">{formatNumber(asset.priceUsd, 2)}</div>
                      <div className={`flex items-center text-xs ${asset.change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                        {asset.change24h >= 0 ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(asset.change24h)}%
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end font-medium">
                      {formatNumber(asset.value, 2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;
