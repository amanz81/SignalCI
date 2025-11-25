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
                        <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
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
                            <label className="block text-sm font-medium mb-2">Condition Type</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={data.conditionType || 'volume'}
                                onChange={(e) => setData({ ...data, conditionType: e.target.value })}
                            >
                                <option value="volume">Volume Check</option>
                                <option value="price">Price Level</option>
                                <option value="rsi">RSI</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div className="mt-3">
                            <label className="block text-sm font-medium mb-2">Threshold</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
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
                            <label className="block text-sm font-medium mb-2">Action Type</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={data.actionType || 'telegram'}
                                onChange={(e) => setData({ ...data, actionType: e.target.value })}
                            >
                                <option value="telegram">Send Telegram</option>
                                <option value="email">Send Email</option>
                                <option value="webhook">Call Webhook</option>
                                <option value="log">Log Only</option>
                            </select>
                        </div>
                        <div className="mt-3">
                            <label className="block text-sm font-medium mb-2">Message Template</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows={3}
                                value={data.message || ''}
                                onChange={(e) => setData({ ...data, message: e.target.value })}
                                placeholder="Signal triggered: {symbol} at {price}"
                            />
                        </div>
                    </>
                );

            default:
                return <p className="text-gray-500">No configuration needed for this node type.</p>;
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-50 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Configure {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800">
                    <strong>Node ID:</strong> {nodeId}
                </div>

                <div className="space-y-4">
                    {renderFields()}
                </div>
            </div>

            <div className="p-4 border-t flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Configuration</Button>
            </div>
        </div>
    );
}
