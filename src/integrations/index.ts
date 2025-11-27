/**
 * Integration Layer - Main Export
 * 
 * This is the main entry point for the integration system.
 * Import from here for cleaner imports throughout the codebase.
 */

// Core types
export * from './core/types';

// Manager (main interface)
export { Integrations, IntegrationManager } from './IntegrationManager';

// Adapters (for advanced use cases or testing)
export { CoinGeckoAdapter } from './metrics/CoinGeckoAdapter';
export { TelegramAdapter } from './actions/TelegramAdapter';

