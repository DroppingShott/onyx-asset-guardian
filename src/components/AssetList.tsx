
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, formatNumber } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import { ArrowDown, ArrowUp, Filter, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fetchUserAssets } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AssetList = () => {
  const { address, isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Use React Query to fetch assets
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', address],
    queryFn: () => fetchUserAssets(address || ''),
    enabled: isConnected && !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  const filteredAssets = assets.filter(asset => {
    // Apply search filter
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.chain && asset.chain.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply risk level filter
    const matchesRiskLevel = riskFilter === 'all' || asset.riskLevel === riskFilter;
    
    return matchesSearch && matchesRiskLevel;
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Get style for risk level badges
  const getRiskBadgeStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-crypto-red/20 text-crypto-red border-crypto-red/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/40';
      case 'low':
        return 'bg-crypto-green/20 text-crypto-green border-crypto-green/40';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets or chains..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select 
              value={riskFilter} 
              onValueChange={setRiskFilter}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-2 py-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-4">Asset</div>
              <div className="col-span-2">Chain</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Risk Level</div>
            </div>
            
            <div className="space-y-1">
              {filteredAssets.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchTerm || riskFilter !== 'all' ? 
                    "No assets found matching your filters" : 
                    "No assets found in your wallet"
                  }
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="grid grid-cols-12 gap-4 rounded-md p-2 hover:bg-muted/50"
                  >
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img 
                          src={asset.image} 
                          alt={asset.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center text-xs text-muted-foreground">
                      {asset.chain || 'Unknown'}
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
                    <div className="col-span-2 flex items-center justify-end">
                      <Badge className={getRiskBadgeStyle(asset.riskLevel)}>
                        <Shield className="h-3 w-3 mr-1" />
                        <span className="capitalize">{asset.riskLevel}</span>
                      </Badge>
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
