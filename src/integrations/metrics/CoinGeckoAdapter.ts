import { IMetricSource } from '../core/types';

/**
 * CoinGecko Adapter
 * 
 * Implements IMetricSource for CoinGecko's public API.
 * This is a free API suitable for POC - no authentication required.
 * 
 * Supported metrics:
 * - price: Current USD price
 * - volume_24h: 24-hour trading volume in USD
 * - market_cap: Market capitalization in USD
 */
export class CoinGeckoAdapter implements IMetricSource {
  id = 'coingecko';
  private baseUrl = 'https://api.coingecko.com/api/v3';

  supports(metricName: string): boolean {
    return ['price', 'volume_24h', 'market_cap'].includes(metricName);
  }

  async getValue(metric: string, asset: string, options?: Record<string, any>): Promise<number> {
    if (!this.supports(metric)) {
      throw new Error(`CoinGecko does not support metric: ${metric}`);
    }

    try {
      // CoinGecko uses lowercase asset IDs (e.g., 'bitcoin', 'ethereum')
      const assetId = asset.toLowerCase();
      
      // Fetch price data with 24h volume and market cap
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${assetId}&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle case where asset is not found
      if (!data[assetId]) {
        throw new Error(`Asset "${asset}" not found on CoinGecko`);
      }

      const assetData = data[assetId];

      // Parse based on what we asked for
      switch (metric) {
        case 'price':
          return assetData.usd || 0;
        
        case 'volume_24h':
          return assetData.usd_24h_vol || 0;
        
        case 'market_cap':
          return assetData.usd_market_cap || 0;
        
        default:
          throw new Error(`Unsupported metric: ${metric}`);
      }
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`CoinGecko getValue failed for ${asset}/${metric}: ${error.message}`);
      }
      throw error;
    }
  }
}

