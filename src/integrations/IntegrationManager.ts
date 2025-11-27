import { IMetricSource, IActionChannel } from './core/types';
import { CoinGeckoAdapter } from './metrics/CoinGeckoAdapter';
import { TelegramAdapter } from './actions/TelegramAdapter';

/**
 * Integration Manager
 * 
 * Singleton orchestrator that manages all metric sources and action channels.
 * This is the main interface that the Inngest Engine will use.
 * 
 * Responsibilities:
 * - Auto-register default adapters
 * - Route metric requests to appropriate sources
 * - Route action requests to appropriate channels
 * - Handle errors gracefully
 */
class IntegrationManager {
  private metrics: Map<string, IMetricSource> = new Map();
  private actions: Map<string, IActionChannel> = new Map();

  constructor() {
    // Auto-register default adapters
    this.registerMetricSource(new CoinGeckoAdapter());
    
    // Telegram adapter requires token from environment or user config
    // For global bot, use env var; for per-user bots, instantiate per request
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (telegramToken) {
      this.registerActionChannel(new TelegramAdapter(telegramToken));
    }
  }

  /**
   * Register a new metric source
   */
  registerMetricSource(source: IMetricSource): void {
    if (this.metrics.has(source.id)) {
      console.warn(`Metric source "${source.id}" already registered, overwriting`);
    }
    this.metrics.set(source.id, source);
  }

  /**
   * Register a new action channel
   */
  registerActionChannel(channel: IActionChannel): void {
    if (this.actions.has(channel.id)) {
      console.warn(`Action channel "${channel.id}" already registered, overwriting`);
    }
    this.actions.set(channel.id, channel);
  }

  /**
   * Get a metric value from a specific source
   * 
   * @param source - The metric source ID (e.g., 'coingecko')
   * @param asset - The asset identifier (e.g., 'bitcoin', 'ethereum')
   * @param metric - The metric name (e.g., 'price', 'volume_24h')
   * @param options - Optional parameters for the metric fetch
   * @returns The numeric value of the metric
   */
  async getMetricValue(
    source: string, 
    asset: string, 
    metric: string,
    options?: Record<string, any>
  ): Promise<number> {
    const adapter = this.metrics.get(source);
    
    if (!adapter) {
      throw new Error(`Unknown metric source: ${source}. Available: ${Array.from(this.metrics.keys()).join(', ')}`);
    }

    if (!adapter.supports(metric)) {
      throw new Error(
        `Metric source "${source}" does not support metric "${metric}". ` +
        `Supported metrics should be checked via adapter.supports()`
      );
    }

    try {
      return await adapter.getValue(metric, asset, options);
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`Failed to get metric ${source}/${asset}/${metric}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Send a notification through a specific action channel
   * 
   * @param channel - The action channel ID (e.g., 'telegram')
   * @param target - The target identifier (e.g., chatId for Telegram)
   * @param message - The message content
   * @param meta - Optional metadata (formatting, attachments, etc.)
   */
  async notify(
    channel: string, 
    target: string, 
    message: string,
    meta?: Record<string, any>
  ): Promise<void> {
    const adapter = this.actions.get(channel);
    
    if (!adapter) {
      throw new Error(`Unknown action channel: ${channel}. Available: ${Array.from(this.actions.keys()).join(', ')}`);
    }

    try {
      await adapter.sendNotification(target, message, meta);
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`Failed to send notification via ${channel}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a metric source adapter (for advanced use cases)
   */
  getMetricSource(sourceId: string): IMetricSource | undefined {
    return this.metrics.get(sourceId);
  }

  /**
   * Get an action channel adapter (for advanced use cases)
   */
  getActionChannel(channelId: string): IActionChannel | undefined {
    return this.actions.get(channelId);
  }

  /**
   * List all registered metric sources
   */
  listMetricSources(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * List all registered action channels
   */
  listActionChannels(): string[] {
    return Array.from(this.actions.keys());
  }

  /**
   * Create a Telegram adapter with a custom token (for per-user bots)
   */
  createTelegramAdapter(token: string): TelegramAdapter {
    return new TelegramAdapter(token);
  }
}

// Export singleton instance
export const Integrations = new IntegrationManager();

// Also export the class for testing or advanced use cases
export { IntegrationManager };

