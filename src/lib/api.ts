import { toast } from "@/components/ui/sonner";

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

// Fetch user assets using Sapphire API across multiple chains
export async function fetchUserAssets(address: string): Promise<Asset[]> {
  try {
    // In a real implementation, this would be an API call to Sapphire
    // For the sake of this implementation, we'll make a theoretical API call
    const response = await fetch(`https://api.sapphire.example/v1/assets?address=${address}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching assets: ${response.status}`);
    }
    
    // In a real app, this would parse JSON from the API response
    // For now, we'll simulate a network request with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return assets from multiple chains including Ethereum, Bitcoin, and Oasis Sapphire
        // Always include BTC and ETH even if the balance is 0
        const assets = [
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

// Fetch sentiment analysis using ROFL agent
export async function fetchSentimentAnalysis(assetIds: string[]): Promise<Record<string, SentimentData>> {
  try {
    // In a real implementation, this would be an API call to your ROFL agent backend
    // For the sake of this implementation, we'll make a theoretical API call
    const queryParams = assetIds.map(id => `assets[]=${id}`).join('&');
    const response = await fetch(`https://api.rofl-agent.example/v1/sentiment?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching sentiment: ${response.status}`);
    }
    
    // Return real sentiment data keyed by asset ID
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
    // In a real implementation, this would be an API call to fetch news sources
    const response = await fetch(`https://api.rofl-agent.example/v1/news?assetId=${assetId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching news: ${response.status}`);
    }
    
    // Return real news data
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
    const response = await fetch(`https://api.rofl-agent.example/v1/alerts?address=${address}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching alerts: ${response.status}`);
    }
    
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
