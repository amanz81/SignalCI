import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, TrendingUp, Globe, Link, Settings } from 'lucide-react';

// Map condition types to readable labels and categories
const conditionLabels: Record<string, { label: string; category: 'market' | 'macro' | 'onchain' | 'custom' }> = {
    volume: { label: 'Volume', category: 'market' },
    price: { label: 'Price', category: 'market' },
    price_change: { label: 'Price Δ%', category: 'market' },
    rsi: { label: 'RSI', category: 'market' },
    macd: { label: 'MACD', category: 'market' },
    moving_avg: { label: 'MA', category: 'market' },
    google_trends: { label: 'G.Trends', category: 'macro' },
    fear_greed: { label: 'Fear/Greed', category: 'macro' },
    social_sentiment: { label: 'Social', category: 'macro' },
    news_sentiment: { label: 'News', category: 'macro' },
    whale_alert: { label: 'Whales', category: 'macro' },
    active_addresses: { label: 'Addresses', category: 'onchain' },
    exchange_flow: { label: 'Ex. Flow', category: 'onchain' },
    hash_rate: { label: 'Hash Rate', category: 'onchain' },
    gas_price: { label: 'Gas', category: 'onchain' },
    webhook_response: { label: 'Webhook', category: 'custom' },
    custom_expression: { label: 'Custom', category: 'custom' },
};

const categoryIcons = {
    market: TrendingUp,
    macro: Globe,
    onchain: Link,
    custom: Settings,
};

const categoryColors = {
    market: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
    macro: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
    onchain: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-500' },
    custom: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500' },
};

interface ConditionData {
    conditionType?: string;
    threshold?: string;
    operator?: string;
    searchTerm?: string;
}

const ConditionNode = ({ data }: { data: ConditionData }) => {
    const conditionType = data.conditionType || 'volume';
    const config = conditionLabels[conditionType] || { label: conditionType, category: 'custom' as const };
    const colors = categoryColors[config.category];
    const Icon = categoryIcons[config.category];
    
    const threshold = data.threshold || 'Not set';
    const operator = data.operator || '>';

    // Build display string
    let displayValue = threshold;
    if (data.searchTerm && conditionType === 'google_trends') {
        displayValue = `"${data.searchTerm}" ${operator} ${threshold}`;
    } else if (threshold !== 'Not set') {
        displayValue = `${operator} ${threshold}`;
    }

    return (
        <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 ${colors.border} hover:opacity-90 transition-all min-w-[160px]`}>
            <div className="flex items-center">
                <div className={`rounded-full w-10 h-10 flex justify-center items-center ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <div className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{config.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}>
                            {config.category.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-gray-500 text-xs truncate" title={displayValue}>
                        {displayValue}
                    </div>
                </div>
            </div>
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-all"
                style={{ top: -6 }}
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-all"
                style={{ bottom: -6 }}
            />
        </div>
    );
};

export default memo(ConditionNode);
