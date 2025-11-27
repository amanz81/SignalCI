import { NextRequest, NextResponse } from 'next/server';
import { Integrations } from '@/integrations/IntegrationManager';

/**
 * Test Integration API Route
 * 
 * This endpoint allows you to test the integration system:
 * 
 * GET /api/test-integration?type=telegram&chatId=YOUR_CHAT_ID
 * GET /api/test-integration?type=metric&source=coingecko&asset=bitcoin&metric=price
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'telegram' or 'metric'

    if (type === 'telegram') {
      // Test Telegram notification
      const chatId = searchParams.get('chatId');
      
      if (!chatId) {
        return NextResponse.json(
          { error: 'chatId parameter is required for Telegram test' },
          { status: 400 }
        );
      }

      // Check if Telegram is configured
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!telegramToken) {
        return NextResponse.json(
          { 
            error: 'TELEGRAM_BOT_TOKEN environment variable is not set',
            hint: 'Set TELEGRAM_BOT_TOKEN in your .env.local file'
          },
          { status: 500 }
        );
      }

      // Test connection
      const adapter = Integrations.getActionChannel('telegram');
      if (!adapter) {
        return NextResponse.json(
          { error: 'Telegram adapter not registered' },
          { status: 500 }
        );
      }

      const isConnected = await adapter.isConnected();
      if (!isConnected) {
        return NextResponse.json(
          { error: 'Telegram bot token is invalid or connection failed' },
          { status: 500 }
        );
      }

      // Send test message
      const testMessage = `🚀 SignalCI System Online 🟢\n\n` +
        `Timestamp: ${new Date().toISOString()}\n` +
        `This is a test notification from SignalCI Integration Layer.`;

      await Integrations.notify('telegram', chatId, testMessage);

      return NextResponse.json({
        success: true,
        message: 'Telegram notification sent successfully',
        chatId,
        timestamp: new Date().toISOString(),
      });

    } else if (type === 'metric') {
      // Test metric fetching
      const source = searchParams.get('source') || 'coingecko';
      const asset = searchParams.get('asset') || 'bitcoin';
      const metric = searchParams.get('metric') || 'price';

      const value = await Integrations.getMetricValue(source, asset, metric);

      return NextResponse.json({
        success: true,
        source,
        asset,
        metric,
        value,
        timestamp: new Date().toISOString(),
      });

    } else {
      // List available integrations
      return NextResponse.json({
        success: true,
        message: 'SignalCI Integration System',
        availableMetricSources: Integrations.listMetricSources(),
        availableActionChannels: Integrations.listActionChannels(),
        usage: {
          telegram: '/api/test-integration?type=telegram&chatId=YOUR_CHAT_ID',
          metric: '/api/test-integration?type=metric&source=coingecko&asset=bitcoin&metric=price',
        },
      });
    }
  } catch (error) {
    console.error('Integration test error:', error);
    
    return NextResponse.json(
      {
        error: 'Integration test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

