
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, NewsSource, SentimentData, fetchNewsSources, fetchSentimentAnalysis } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, Info, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SentimentAnalysis = ({ assets }: { assets: Asset[] }) => {
  const { isConnected } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<Record<string, SentimentData>>({});
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);

  useEffect(() => {
    const loadSentimentData = async () => {
      if (isConnected && assets.length > 0) {
        setLoading(true);
        try {
          const assetIds = assets.map(asset => asset.id);
          const data = await fetchSentimentAnalysis(assetIds);
          setSentimentData(data);
          
          // Set first asset as selected if none selected
          if (!selectedAsset && assets.length > 0) {
            setSelectedAsset(assets[0].id);
          }
        } catch (error) {
          console.error("Failed to load sentiment data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSentimentData();
  }, [isConnected, assets, selectedAsset]);

  useEffect(() => {
    const loadNewsSources = async () => {
      if (selectedAsset) {
        setLoadingNews(true);
        try {
          const sources = await fetchNewsSources(selectedAsset);
          setNewsSources(sources);
        } catch (error) {
          console.error("Failed to load news sources:", error);
        } finally {
          setLoadingNews(false);
        }
      }
    };

    loadNewsSources();
  }, [selectedAsset]);

  const handleAssetChange = (value: string) => {
    setSelectedAsset(value);
  };

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (sentiment === 'positive') return <Check className="h-4 w-4 text-crypto-green" />;
    if (sentiment === 'negative') return <AlertTriangle className="h-4 w-4 text-crypto-red" />;
    return <Info className="h-4 w-4 text-crypto-blue" />;
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (sentiment === 'positive') return 'bg-crypto-green/20 text-crypto-green border-crypto-green/40';
    if (sentiment === 'negative') return 'bg-crypto-red/20 text-crypto-red border-crypto-red/40';
    return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/40';
  };

  if (!isConnected || assets.length === 0) {
    return null;
  }

  const currentSentiment = selectedAsset && sentimentData[selectedAsset] 
    ? sentimentData[selectedAsset] 
    : null;

  const chartData = currentSentiment ? [
    { name: 'Positive', value: currentSentiment.positive },
    { name: 'Negative', value: currentSentiment.negative },
    { name: 'Neutral', value: currentSentiment.neutral }
  ] : [];

  const COLORS = ['#16C784', '#EA3943', '#3861FB'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select 
            value={selectedAsset || ''} 
            onValueChange={handleAssetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center">
                    <img 
                      src={asset.image} 
                      alt={asset.symbol} 
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    {asset.name} ({asset.symbol})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : currentSentiment ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']} 
                      contentStyle={{ background: '#1f1f23', border: '1px solid #2a2a2e' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between space-x-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-crypto-green mr-1.5"></div>
                  <span className="text-xs">Positive ({currentSentiment.positive}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-crypto-red mr-1.5"></div>
                  <span className="text-xs">Negative ({currentSentiment.negative}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-crypto-blue mr-1.5"></div>
                  <span className="text-xs">Neutral ({currentSentiment.neutral}%)</span>
                </div>
              </div>
              <div className="mt-4">
                <Badge className={`px-3 py-1 ${getSentimentColor(currentSentiment.overall)}`}>
                  {getSentimentIcon(currentSentiment.overall)}
                  <span className="ml-1 capitalize">{currentSentiment.overall} Overall Sentiment</span>
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="mb-2 text-sm font-medium">Recent News Sources</div>
              {loadingNews ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : newsSources.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No news sources found
                </div>
              ) : (
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 hide-scrollbar">
                  {newsSources.map((news) => (
                    <div key={news.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-medium hover:text-primary hover:underline line-clamp-2"
                          >
                            {news.title}
                          </a>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {news.source} • {news.date}
                          </div>
                        </div>
                        <Badge className={`ml-2 ${getSentimentColor(news.sentiment)}`}>
                          {getSentimentIcon(news.sentiment)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{news.snippet}</p>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Select an asset to view sentiment analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;
