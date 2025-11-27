/**
 * Core Integration Types
 * 
 * These interfaces define the "contract" that all metric sources and action channels
 * must follow. This enables plug-and-play extensibility.
 */

// 1. Metric Source Contract (Data Pull)
// Passive sources that we query for data
export interface IMetricSource {
  id: string; // e.g., 'coingecko', 'binance'
  
  // Returns true if this source can handle the requested metric
  supports(metricName: string): boolean; 
  
  // The standardized fetch method
  // Returns the numeric value for the requested metric
  getValue(metricName: string, asset: string, options?: Record<string, any>): Promise<number>;
}

// 2. Action Channel Contract (Data Push)
// Active channels that we send notifications/actions to
export interface IActionChannel {
  id: string; // e.g., 'telegram', 'discord'
  
  // Returns true if the user has configured this channel correctly
  isConnected(credentials?: any): Promise<boolean>;
  
  // The standardized send method
  // to: target identifier (chatId, channelId, etc.)
  // message: the message content
  // meta: optional metadata (formatting, attachments, etc.)
  sendNotification(to: string, message: string, meta?: Record<string, any>): Promise<void>;
}

// Type guard helpers
export function isMetricSource(obj: any): obj is IMetricSource {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.supports === 'function' &&
    typeof obj.getValue === 'function';
}

export function isActionChannel(obj: any): obj is IActionChannel {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.isConnected === 'function' &&
    typeof obj.sendNotification === 'function';
}

