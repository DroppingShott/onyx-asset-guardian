
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, fetchUserAssets, formatNumber } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import { AlertTriangle, ChartBar, ChartLine, Shield } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const Portfolio = () => {
  const { address, isConnected } = useWallet();
  const [portfolioChart, setPortfolioChart] = useState<{ name: string; value: number }[]>([]);

  // Use React Query for data fetching with automatic refetching
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', address],
    queryFn: () => fetchUserAssets(address || ''),
    enabled: isConnected && !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if (assets.length > 0) {
      // Generate portfolio history data based on real asset values
      const now = new Date();
      const mockData = [];
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Calculate a slightly varying portfolio value for the chart
        const randomFactor = 0.9 + Math.random() * 0.2; // Random factor between 0.9 and 1.1
        const adjustedValue = totalValue * randomFactor * (1 + i/100);
        
        mockData.push({
          name: formattedDate,
          value: adjustedValue
        });
      }
      setPortfolioChart(mockData);
    }
  }, [assets]);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const topAssets = [...assets].sort((a, b) => b.value - a.value).slice(0, 3);

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
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Portfolio Overview</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your asset allocation and performance
              </CardDescription>
            </div>
            <div className="text-2xl font-bold">{formatNumber(totalValue)}</div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioChart}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                    contentStyle={{ background: '#1f1f23', border: '1px solid #2a2a2e' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3861FB" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        Array(3).fill(0).map((_, index) => (
          <Card key={index} className="portfolio-card animate-pulse">
            <CardHeader className="p-4 pb-2">
              <div className="h-8 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        topAssets.map((asset) => (
          <Card key={asset.id} className="portfolio-card">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
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
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>{asset.symbol}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatNumber(asset.value)}</div>
                  <div className={`flex items-center justify-end text-sm ${asset.change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <div className="flex justify-between items-center text-sm">
                <div className="text-muted-foreground">Amount</div>
                <div>{asset.amount} {asset.symbol}</div>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="text-muted-foreground">Price</div>
                <div>{formatNumber(asset.priceUsd)}</div>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="text-muted-foreground">Risk Score</div>
                <div className="flex items-center">
                  <ChartBar className="h-4 w-4 mr-1 text-crypto-purple" />
                  <span>{asset.riskScore}/100</span>
                </div>
              </div>
              <div className="mt-3">
                <Badge className={`w-full justify-center ${getRiskBadgeStyle(asset.riskLevel)}`}>
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  <span className="capitalize">{asset.riskLevel} Risk</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Portfolio;
