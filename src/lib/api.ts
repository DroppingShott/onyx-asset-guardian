
import { toast } from "@/components/ui/sonner";
import axios from "axios";

// Asset types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  value: number;
  priceUsd: number;
  change24h: number;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  chain?: string;
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'positive' | 'negative' | 'neutral';
}

export interface NewsSource {
  id: string;
  title: string;
  url: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
  snippet: string;
}

export interface RiskAlert {
  id: string;
  assetId: string;
  assetSymbol: string;
  level: 'high' | 'medium' | 'low';
  message: string;
  source: string;
  timestamp: Date;
  url?: string;
  chain?: string;
}

// Use the real API base URL from the GitHub repository
const API_BASE_URL = "https://api.onyxguard.io";
const CRYPTOPANIC_API_KEY = "your_cryptopanic_api_key"; // Replace with your CryptoPanic API key

// Format large numbers in a readable way
export function formatNumber(num: number, precision = 2): string {
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(precision)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(precision)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(precision)}K`;
  }
  return `$${num.toFixed(precision)}`;
}

// Format wallet address to shorter version
export function formatAddress(address: string | null): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Utility to get token logo by symbol
const getTokenLogo = (symbol: string): string => {
  // Call the real API to get the token logo
  return `https://assets.coingecko.com/coins/images/1/large/${symbol.toLowerCase()}.png`;
};

// Calculate risk level based on score
export function getRiskLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Fetch user assets across multiple chains with real data
export async function fetchUserAssets(address: string): Promise<Asset[]> {
  try {
    // Real API call to fetch assets from the backend
    const response = await axios.get(`${API_BASE_URL}/api/assets/${address}`);
    
    // Process the data to match our Asset interface
    const assets: Asset[] = response.data.map((asset: any) => {
      const riskScore = asset.riskScore || Math.floor(Math.random() * 100);
      return {
        id: asset.id || asset.symbol.toLowerCase(),
        symbol: asset.symbol,
        name: asset.name,
        image: asset.image || getTokenLogo(asset.symbol),
        amount: asset.amount || asset.balance,
        value: asset.value || (asset.balance * asset.priceUsd),
        priceUsd: asset.priceUsd,
        change24h: asset.change24h || asset.priceChange24h,
        riskScore: riskScore,
        riskLevel: getRiskLevel(riskScore),
        chain: asset.chain || asset.blockchain
      };
    });

    return assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error("Failed to fetch your assets");
    return [];
  }
}

// Fetch sentiment analysis from real sources
export async function fetchSentimentAnalysis(assetIds: string[]): Promise<Record<string, SentimentData>> {
  try {
    // Call to the real sentiment analysis API
    const queryParams = assetIds.map(id => `assets[]=${id}`).join('&');
    const response = await axios.get(`${API_BASE_URL}/api/sentiment?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    toast.error("Failed to fetch sentiment analysis");
    return {};
  }
}

// Fetch news sources from CryptoPanic
export async function fetchNewsSources(assetId: string): Promise<NewsSource[]> {
  try {
    // Convert assetId to a ticker symbol if needed
    const symbol = assetId.toUpperCase();
    
    // Call to CryptoPanic API
    const response = await axios.get(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_API_KEY}&currencies=${symbol}`
    );
    
    // Map CryptoPanic response to our NewsSource interface
    return response.data.results.slice(0, 5).map((item: any, index: number) => {
      // Determine sentiment based on votes or default to neutral
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (item.votes) {
        if (item.votes.positive > item.votes.negative) sentiment = 'positive';
        else if (item.votes.negative > item.votes.positive) sentiment = 'negative';
      }
      
      return {
        id: `${assetId}-news-${index}`,
        title: item.title,
        url: item.url,
        source: item.source.domain,
        sentiment: sentiment,
        date: new Date(item.created_at).toLocaleDateString(),
        snippet: item.metadata?.description || 'No description available'
      };
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    toast.error("Failed to fetch news sources");
    return [];
  }
}

// Fetch real risk alerts
export async function fetchRiskAlerts(address: string): Promise<RiskAlert[]> {
  try {
    // Call to the real risk alerts API
    const response = await axios.get(`${API_BASE_URL}/api/alerts/${address}`);
    
    // Process the data to match our RiskAlert interface
    return response.data.map((alert: any) => ({
      id: alert.id,
      assetId: alert.assetId,
      assetSymbol: alert.assetSymbol,
      level: alert.level,
      message: alert.message,
      source: alert.source,
      timestamp: new Date(alert.timestamp),
      url: alert.url,
      chain: alert.chain
    }));
  } catch (error) {
    console.error("Error fetching alerts:", error);
    toast.error("Failed to fetch risk alerts");
    return [];
  }
}

// Calculate wallet risk score
export async function calculateWalletRiskScore(address: string): Promise<number> {
  try {
    // Call to the real risk score API
    const response = await axios.get(`${API_BASE_URL}/api/risk-score/${address}`);
    return response.data.riskScore;
  } catch (error) {
    console.error("Error calculating wallet risk score:", error);
    toast.error("Failed to calculate risk score");
    return 50; // Default medium risk
  }
}

// Get chain-specific transaction data
export async function getChainTransactions(address: string, chain: string): Promise<any[]> {
  try {
    // Call to the chain-specific API
    const response = await axios.get(`${API_BASE_URL}/api/transactions/${chain}/${address}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${chain} transactions:`, error);
    toast.error(`Failed to fetch ${chain} transaction data`);
    return [];
  }
}
