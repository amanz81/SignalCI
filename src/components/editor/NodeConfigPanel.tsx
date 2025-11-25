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

export default function NodeConfigPanel({ nodeId, nodeType, nodeData, onClose, onSave }: NodeConfigPanelProps) {
    const [data, setData] = useState(nodeData || {});

    const handleSave = () => {
        onSave(data);
        onClose();
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
                return (
                    <>
                        <div>
                            <label className={labelStyles}>Condition Type</label>
                            <select
                                className={selectStyles}
                                value={data.conditionType || 'volume'}
                                onChange={(e) => setData({ ...data, conditionType: e.target.value })}
                            >
                                <option value="volume">Volume Check</option>
                                <option value="price">Price Level</option>
                                <option value="rsi">RSI</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className={labelStyles}>Threshold</label>
                            <input
                                type="text"
                                className={inputStyles}
                                value={data.threshold || ''}
                                onChange={(e) => setData({ ...data, threshold: e.target.value })}
                                placeholder="e.g., > 1000000"
                            />
                        </div>
                    </>
                );

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
