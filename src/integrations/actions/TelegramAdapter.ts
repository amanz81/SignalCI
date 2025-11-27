import { IActionChannel } from '../core/types';

/**
 * Telegram Adapter
 * 
 * Implements IActionChannel for Telegram Bot API.
 * Uses the official Telegram Bot API via HTTP requests (no heavy dependencies).
 * 
 * Setup:
 * 1. Go to @BotFather on Telegram
 * 2. Create New Bot -> Get Token
 * 3. Get your Chat ID from @userinfobot
 */
export class TelegramAdapter implements IActionChannel {
  id = 'telegram';
  private botToken: string;
  private baseUrl = 'https://api.telegram.org';

  constructor(token: string) {
    if (!token || token.trim().length === 0) {
      throw new Error('Telegram bot token is required');
    }
    this.botToken = token.trim();
  }

  async isConnected(credentials?: any): Promise<boolean> {
    try {
      const token = credentials?.token || this.botToken;
      const response = await fetch(
        `${this.baseUrl}/bot${token}/getMe`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.ok === true && !!data.result;
    } catch (error) {
      console.error('Telegram connection check failed:', error);
      return false;
    }
  }

  async sendNotification(
    chatId: string, 
    message: string, 
    meta?: Record<string, any>
  ): Promise<void> {
    if (!chatId || chatId.trim().length === 0) {
      throw new Error('Telegram chat ID is required');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    try {
      const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;
      
      const payload: {
        chat_id: string;
        text: string;
        parse_mode?: string;
        disable_web_page_preview?: boolean;
        [key: string]: any;
      } = {
        chat_id: chatId,
        text: message,
        parse_mode: meta?.parseMode || 'Markdown', // Allows bolding/formatting
        disable_web_page_preview: meta?.disablePreview || false,
      };

      // Merge any additional metadata
      if (meta) {
        Object.keys(meta).forEach(key => {
          if (!['parseMode', 'disablePreview'].includes(key)) {
            payload[key] = meta[key];
          }
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Telegram API error: ${response.status} ${response.statusText}. ` +
          `Details: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram send failed: ${data.description || 'Unknown error'}`);
      }
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw new Error(`Telegram sendNotification failed: ${error.message}`);
      }
      throw error;
    }
  }
}

