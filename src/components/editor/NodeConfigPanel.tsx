"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NodeConfigPanelProps {
    nodeId: string;
    nodeType: string;
    nodeData: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

const inputStyles = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
const selectStyles = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer";
const labelStyles = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";
const helpTextStyles = "text-xs text-gray-500 dark:text-gray-400 mt-1";

// Condition type configurations
const conditionCategories = {
    market: {
        label: '📊 Market Metrics',
        options: [
            { value: 'volume', label: 'Volume', placeholder: 'e.g., > 1000000', help: 'Check trading volume against threshold' },
            { value: 'price', label: 'Price Level', placeholder: 'e.g., > 50000', help: 'Check if price crosses a level' },
            { value: 'price_change', label: 'Price Change %', placeholder: 'e.g., > 5', help: 'Check percentage change in price' },
            { value: 'rsi', label: 'RSI (Relative Strength)', placeholder: 'e.g., < 30 or > 70', help: 'RSI overbought/oversold levels' },
            { value: 'macd', label: 'MACD Signal', placeholder: 'e.g., crossover', help: 'MACD crossover signals' },
            { value: 'moving_avg', label: 'Moving Average', placeholder: 'e.g., price > MA50', help: 'Price vs moving average' },
        ]
    },
    macro: {
        label: '🌍 Macro & Sentiment',
        options: [
            { value: 'google_trends', label: 'Google Trends', placeholder: 'e.g., "bitcoin" > 80', help: 'Search interest on Google Trends' },
            { value: 'fear_greed', label: 'Fear & Greed Index', placeholder: 'e.g., < 25 (extreme fear)', help: 'Crypto Fear & Greed Index' },
            { value: 'social_sentiment', label: 'Social Sentiment', placeholder: 'e.g., twitter_positive > 60%', help: 'Social media sentiment analysis' },
            { value: 'news_sentiment', label: 'News Sentiment', placeholder: 'e.g., sentiment > 0.5', help: 'News article sentiment score' },
            { value: 'whale_alert', label: 'Whale Activity', placeholder: 'e.g., transfers > $10M', help: 'Large wallet movements' },
        ]
    },
    onchain: {
        label: '⛓️ On-Chain Data',
        options: [
            { value: 'active_addresses', label: 'Active Addresses', placeholder: 'e.g., > 1000000', help: 'Number of active addresses' },
            { value: 'exchange_flow', label: 'Exchange Net Flow', placeholder: 'e.g., outflow > 1000 BTC', help: 'Net flow to/from exchanges' },
            { value: 'hash_rate', label: 'Hash Rate', placeholder: 'e.g., change > 5%', help: 'Network hash rate changes' },
            { value: 'gas_price', label: 'Gas Price (ETH)', placeholder: 'e.g., < 30 gwei', help: 'Ethereum gas price level' },
        ]
    },
    custom: {
        label: '⚙️ Custom',
        options: [
            { value: 'webhook_response', label: 'Webhook Response', placeholder: 'e.g., response.value > 100', help: 'Custom webhook API response' },
            { value: 'custom_expression', label: 'Custom Expression', placeholder: 'e.g., {price} > {ma50} && {volume} > 1M', help: 'Write your own condition' },
        ]
    }
};

// Get condition config by value
const getConditionConfig = (conditionType: string) => {
    for (const category of Object.values(conditionCategories)) {
        const found = category.options.find(opt => opt.value === conditionType);
        if (found) return found;
    }
    return { value: conditionType, label: conditionType, placeholder: '', help: '' };
};

export default function NodeConfigPanel({ nodeId, nodeType, nodeData, onClose, onSave }: NodeConfigPanelProps) {
    const [data, setData] = useState(nodeData || {});

    const handleSave = () => {
        onSave(data);
        onClose();
    };

    const renderConditionFields = () => {
        const conditionConfig = getConditionConfig(data.conditionType || 'volume');
        
        return (
            <>
                <div>
                    <label className={labelStyles}>Condition Category</label>
                    <select
                        className={selectStyles}
                        value={data.conditionType || 'volume'}
                        onChange={(e) => setData({ ...data, conditionType: e.target.value, threshold: '' })}
                    >
                        {Object.entries(conditionCategories).map(([key, category]) => (
                            <optgroup key={key} label={category.label}>
                                {category.options.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <p className={helpTextStyles}>{conditionConfig.help}</p>
                </div>

                <div className="mt-4">
                    <label className={labelStyles}>Threshold / Expression</label>
                    <input
                        type="text"
                        className={inputStyles}
                        value={data.threshold || ''}
                        onChange={(e) => setData({ ...data, threshold: e.target.value })}
                        placeholder={conditionConfig.placeholder}
                    />
                </div>

                {/* Additional fields for specific condition types */}
                {data.conditionType === 'google_trends' && (
                    <div className="mt-4">
                        <label className={labelStyles}>Search Term</label>
                        <input
                            type="text"
                            className={inputStyles}
                            value={data.searchTerm || ''}
                            onChange={(e) => setData({ ...data, searchTerm: e.target.value })}
                            placeholder="e.g., bitcoin, ethereum, crypto"
                        />
                        <p className={helpTextStyles}>The keyword to track on Google Trends</p>
                    </div>
                )}

                {data.conditionType === 'social_sentiment' && (
                    <div className="mt-4">
                        <label className={labelStyles}>Platform</label>
                        <select
                            className={selectStyles}
                            value={data.platform || 'twitter'}
                            onChange={(e) => setData({ ...data, platform: e.target.value })}
                        >
                            <option value="twitter">Twitter/X</option>
                            <option value="reddit">Reddit</option>
                            <option value="telegram">Telegram</option>
                            <option value="all">All Platforms</option>
                        </select>
                    </div>
                )}

                {data.conditionType === 'webhook_response' && (
                    <div className="mt-4">
                        <label className={labelStyles}>Webhook URL</label>
                        <input
                            type="url"
                            className={inputStyles}
                            value={data.webhookUrl || ''}
                            onChange={(e) => setData({ ...data, webhookUrl: e.target.value })}
                            placeholder="https://api.example.com/data"
                        />
                        <p className={helpTextStyles}>API endpoint to fetch data from</p>
                    </div>
                )}

                {(data.conditionType === 'moving_avg' || data.conditionType === 'macd') && (
                    <div className="mt-4">
                        <label className={labelStyles}>Timeframe</label>
                        <select
                            className={selectStyles}
                            value={data.timeframe || '1h'}
                            onChange={(e) => setData({ ...data, timeframe: e.target.value })}
                        >
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">1 Day</option>
                        </select>
                    </div>
                )}

                <div className="mt-4">
                    <label className={labelStyles}>Comparison Operator</label>
                    <select
                        className={selectStyles}
                        value={data.operator || '>'}
                        onChange={(e) => setData({ ...data, operator: e.target.value })}
                    >
                        <option value=">">Greater than (&gt;)</option>
                        <option value=">=">Greater than or equal (&gt;=)</option>
                        <option value="<">Less than (&lt;)</option>
                        <option value="<=">Less than or equal (&lt;=)</option>
                        <option value="==">Equal to (==)</option>
                        <option value="!=">Not equal to (!=)</option>
                        <option value="crossover">Crossover (above)</option>
                        <option value="crossunder">Crossunder (below)</option>
                    </select>
                </div>
            </>
        );
    };

    const renderFields = () => {
        switch (nodeType) {
            case 'wait':
                return (
                    <div>
                        <label className={labelStyles}>Duration (seconds)</label>
                        <input
                            type="number"
                            className={inputStyles}
                            value={data.duration || 10}
                            onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) })}
                            placeholder="10"
                        />
                    </div>
                );

            case 'condition':
                return renderConditionFields();

            case 'action':
                return (
                    <>
                        <div>
                            <label className={labelStyles}>Action Type</label>
                            <select
                                className={selectStyles}
                                value={data.actionType || 'telegram'}
                                onChange={(e) => setData({ ...data, actionType: e.target.value })}
                            >
                                <option value="telegram">Send Telegram</option>
                                <option value="email">Send Email</option>
                                <option value="webhook">Call Webhook</option>
                                <option value="log">Log Only</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className={labelStyles}>Message Template</label>
                            <textarea
                                className={`${inputStyles} resize-none`}
                                rows={4}
                                value={data.message || ''}
                                onChange={(e) => setData({ ...data, message: e.target.value })}
                                placeholder="Signal triggered: {symbol} at {price}"
                            />
                        </div>
                    </>
                );

            default:
                return <p className="text-gray-500 dark:text-gray-400">No configuration needed for this node type.</p>;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Node Properties</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Configuration</p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4 text-xs">
                    <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Node ID</div>
                    <code className="text-blue-700 dark:text-blue-400 font-mono">{nodeId}</code>
                </div>

                <div className="space-y-4">
                    {renderFields()}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">Save</Button>
            </div>
        </div>
    );
}
