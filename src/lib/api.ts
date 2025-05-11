
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
  chain?: string; // Added chain field to identify blockchain network
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
  chain?: string; // Added chain field to identify blockchain network
}

// API base URL - in production this would point to your deployed API
const API_BASE_URL = "https://eth-risk-analysis-api.example.com";

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
  const logoMap: Record<string, string> = {
    BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    ROSE: "https://assets.coingecko.com/coins/images/13162/large/rose.png",
    BNB: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  };

  return logoMap[symbol] || "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
};

// Fetch user assets across multiple chains
export async function fetchUserAssets(address: string): Promise<Asset[]> {
  // For development, we'll use the mock data but structured to simulate the real API
  try {
    // In a real implementation, this would be an API call to your deployed backend
    // const response = await axios.get(`${API_BASE_URL}/api/assets/${address}`);
    // return response.data;
    
    // For now, simulate an API response with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Ensure BTC and ETH are always included even with zero balance
        const assets: Asset[] = [
          {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            amount: 0.5,
            value: 16235.50,
            priceUsd: 32471.00,
            change24h: 2.3,
            riskScore: 25,
            chain: 'Bitcoin'
          },
          {
            id: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            amount: 3.2,
            value: 5760.00,
            priceUsd: 1800.00,
            change24h: -1.2,
            riskScore: 30,
            chain: 'Ethereum'
          },
          {
            id: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            amount: 25.0,
            value: 1250.00,
            priceUsd: 50.00,
            change24h: 5.8,
            riskScore: 45,
            chain: 'Solana'
          },
          {
            id: 'rose',
            symbol: 'ROSE',
            name: 'Oasis Network',
            image: 'https://assets.coingecko.com/coins/images/13162/large/rose.png',
            amount: 1000.0,
            value: 650.00,
            priceUsd: 0.65,
            change24h: 3.2,
            riskScore: 40,
            chain: 'Oasis Sapphire Testnet'
          },
          {
            id: 'bnb',
            symbol: 'BNB',
            name: 'Binance Coin',
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
            amount: 2.5,
            value: 750.00,
            priceUsd: 300.00,
            change24h: 1.8,
            riskScore: 35,
            chain: 'BNB Chain'
          }
        ];
        
        resolve(assets);
      }, 1000);
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error("Failed to fetch your assets");
    return [];
  }
}

// Fetch sentiment analysis from ROFL agent
export async function fetchSentimentAnalysis(assetIds: string[]): Promise<Record<string, SentimentData>> {
  try {
    // In a real implementation, this would be an API call to your ROFL agent backend
    // const queryParams = assetIds.map(id => `assets[]=${id}`).join('&');
    // const response = await axios.get(`${API_BASE_URL}/api/sentiment?${queryParams}`);
    // return response.data;
    
    // For now, simulate an API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          'bitcoin': {
            positive: 65,
            negative: 15,
            neutral: 20,
            overall: 'positive'
          },
          'ethereum': {
            positive: 55,
            negative: 25,
            neutral: 20,
            overall: 'positive'
          },
          'solana': {
            positive: 42,
            negative: 48,
            neutral: 10,
            overall: 'negative'
          },
          'rose': {
            positive: 58,
            negative: 22,
            neutral: 20,
            overall: 'positive'
          },
          'bnb': {
            positive: 50,
            negative: 30,
            neutral: 20,
            overall: 'positive'
          }
        });
      }, 800);
    });
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    toast.error("Failed to fetch sentiment analysis");
    return {};
  }
}

// Fetch news sources that contribute to sentiment
export async function fetchNewsSources(assetId: string): Promise<NewsSource[]> {
  try {
    // In a real implementation, this would be an API call
    // const response = await axios.get(`${API_BASE_URL}/api/news/${assetId}`);
    // return response.data;
    
    // Return mock news data
    return new Promise((resolve) => {
      setTimeout(() => {
        if (assetId === 'bitcoin') {
          resolve([
            {
              id: 'news1',
              title: 'Bitcoin ETF Sees Record Inflows As Market Sentiment Improves',
              url: 'https://example.com/bitcoin-etf-inflows',
              source: 'CryptoNews',
              sentiment: 'positive',
              date: '2025-05-10',
              snippet: 'Bitcoin ETFs have seen over $500M in inflows this week, indicating strong institutional interest.'
            },
            {
              id: 'news2',
              title: 'Technical Analysis: Bitcoin Breaks Key Resistance Level',
              url: 'https://example.com/btc-resistance',
              source: 'TradingView',
              sentiment: 'positive',
              date: '2025-05-09',
              snippet: 'Bitcoin has broken through the $32,000 resistance level, potentially signaling a new bull run.'
            }
          ]);
        } else if (assetId === 'ethereum') {
          resolve([
            {
              id: 'news3',
              title: 'Ethereum Layer 2 Solutions Continue to Gain Traction',
              url: 'https://example.com/eth-layer2',
              source: 'DeFi Pulse',
              sentiment: 'positive',
              date: '2025-05-10',
              snippet: 'Ethereum scaling solutions are seeing increased adoption with over $5B locked in L2 protocols.'
            },
            {
              id: 'news4',
              title: 'SEC Concerns Over Ethereum Staking Could Impact Future',
              url: 'https://example.com/sec-ethereum',
              source: 'Regulatory Watch',
              sentiment: 'negative',
              date: '2025-05-08',
              snippet: 'New statements from SEC officials raise questions about the regulatory status of ETH staking.'
            }
          ]);
        } else if (assetId === 'solana') {
          resolve([
            {
              id: 'news5',
              title: 'Solana Network Experiences Third Outage This Month',
              url: 'https://example.com/solana-outage',
              source: 'BlockchainMonitor',
              sentiment: 'negative',
              date: '2025-05-10',
              snippet: 'Solana blockchain halted for 2 hours due to a consensus failure in validator nodes.'
            },
            {
              id: 'news6',
              title: 'Major DeFi Project Abandons Solana for Ethereum',
              url: 'https://example.com/defi-leaves-solana',
              source: 'DeFi Daily',
              sentiment: 'negative',
              date: '2025-05-09',
              snippet: 'A top 10 Solana DeFi protocol announces plans to migrate to Ethereum, citing stability concerns.'
            }
          ]);
        } else if (assetId === 'rose') {
          resolve([
            {
              id: 'news7',
              title: 'Oasis Labs Partners with Major Financial Institution',
              url: 'https://example.com/oasis-partnership',
              source: 'BlockchainNews',
              sentiment: 'positive',
              date: '2025-05-10',
              snippet: 'Oasis Labs announces strategic partnership with a top-10 global bank for privacy-preserving analytics.'
            },
            {
              id: 'news8',
              title: 'Oasis Network Testnet Performance Improves with Recent Update',
              url: 'https://example.com/oasis-update',
              source: 'CryptoTech',
              sentiment: 'positive',
              date: '2025-05-09',
              snippet: 'Latest testnet update shows 40% improvement in transaction throughput and lower gas fees.'
            }
          ]);
        } else {
          resolve([]);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    toast.error("Failed to fetch news sources");
    return [];
  }
}

// Fetch risk alerts from multiple chains
export async function fetchRiskAlerts(address: string): Promise<RiskAlert[]> {
  try {
    // In a real implementation, this would fetch alerts from your backend
    // const response = await axios.get(`${API_BASE_URL}/api/alerts/${address}`);
    // return response.data.map((alert: any) => ({
    //   ...alert,
    //   timestamp: new Date(alert.timestamp)
    // }));
    
    // Return the 5 most recent alerts from various chains
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'alert1',
            assetId: 'solana',
            assetSymbol: 'SOL',
            level: 'high',
            message: 'Network instability reported',
            source: 'BlockchainMonitor',
            timestamp: new Date(),
            url: 'https://example.com/solana-outage',
            chain: 'Solana'
          },
          {
            id: 'alert2',
            assetId: 'ethereum',
            assetSymbol: 'ETH',
            level: 'medium',
            message: 'Potential regulatory concerns',
            source: 'Regulatory Watch',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            url: 'https://example.com/sec-ethereum',
            chain: 'Ethereum'
          },
          {
            id: 'alert3',
            assetId: 'rose',
            assetSymbol: 'ROSE',
            level: 'low',
            message: 'Testnet performance improvements',
            source: 'Oasis Labs',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            url: 'https://example.com/oasis-improvements',
            chain: 'Oasis Sapphire Testnet'
          },
          {
            id: 'alert4',
            assetId: 'bitcoin',
            assetSymbol: 'BTC',
            level: 'medium',
            message: 'Mining difficulty adjustment expected',
            source: 'BitcoinAnalytics',
            timestamp: new Date(Date.now() - 10800000), // 3 hours ago
            url: 'https://example.com/btc-mining',
            chain: 'Bitcoin'
          },
          {
            id: 'alert5',
            assetId: 'bnb',
            assetSymbol: 'BNB',
            level: 'high',
            message: 'New regulatory compliance requirements',
            source: 'BinanceNews',
            timestamp: new Date(Date.now() - 14400000), // 4 hours ago
            url: 'https://example.com/bnb-regulation',
            chain: 'BNB Chain'
          }
        ]);
      }, 600);
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    toast.error("Failed to fetch risk alerts");
    return [];
  }
}

// Calculate risk score for a wallet based on its assets and transaction history
export async function calculateWalletRiskScore(address: string): Promise<number> {
  try {
    // In a real implementation, this would call your risk analysis API
    // const response = await axios.get(`${API_BASE_URL}/api/risk-score/${address}`);
    // return response.data.riskScore;
    
    // For now, return a mock risk score between 1-100
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a risk score calculation
        const riskScore = Math.floor(Math.random() * 60) + 20; // Score between 20-80
        resolve(riskScore);
      }, 800);
    });
  } catch (error) {
    console.error("Error calculating wallet risk score:", error);
    toast.error("Failed to calculate risk score");
    return 50; // Default medium risk
  }
}

// Get chain-specific transaction data
export async function getChainTransactions(address: string, chain: string): Promise<any[]> {
  try {
    // In a real implementation, this would query the specific chain's API
    // const response = await axios.get(`${API_BASE_URL}/api/transactions/${chain}/${address}`);
    // return response.data;
    
    // For now, return mock transaction data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          // Mock transaction data would go here
          // This would be chain-specific transaction data
        ]);
      }, 1000);
    });
  } catch (error) {
    console.error(`Error fetching ${chain} transactions:`, error);
    toast.error(`Failed to fetch ${chain} transaction data`);
    return [];
  }
}
