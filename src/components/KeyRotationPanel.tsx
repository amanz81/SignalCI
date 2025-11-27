"use client";

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Key, Shield } from 'lucide-react';

interface ApiKey {
    id: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
}

interface KeyRotationPanelProps {
    pipelineId: string;
    apiKeys: ApiKey[];
    onRevoke?: () => void;
}

export default function KeyRotationPanel({ pipelineId, apiKeys, onRevoke }: KeyRotationPanelProps) {
    const [revoking, setRevoking] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRevoke = async (provider: string) => {
        if (!confirm(`⚠️ WARNING: This will permanently delete your ${provider.toUpperCase()} API key from our Vault.\n\nThis action cannot be undone. Are you absolutely sure?`)) {
            return;
        }

        setRevoking(provider);
        setError(null);

        try {
            const response = await fetch(`/api/pipelines/${pipelineId}/revoke-key`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to revoke key');
            }

            // Success - refresh the page or call callback
            if (onRevoke) {
                onRevoke();
            } else {
                window.location.reload();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to revoke key');
        } finally {
            setRevoking(null);
        }
    };

    const getProviderDisplayName = (provider: string) => {
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    };

    const getProviderIcon = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'binance':
                return '🟡';
            case 'coinbase':
                return '🔵';
            case 'telegram':
                return '📱';
            default:
                return '🔑';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">API Key Management</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    If you suspect your API keys are compromised, revoke them immediately. Keys are stored encrypted in Supabase Vault.
                </p>
            </div>

            {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Error</p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="p-6">
                {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No API keys configured for this pipeline</p>
                        <p className="text-xs mt-1">Add API keys in pipeline settings to enable integrations</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {apiKeys.map((key) => (
                            <div
                                key={key.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getProviderIcon(key.provider)}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {getProviderDisplayName(key.provider)}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Added {new Date(key.createdAt).toLocaleDateString()}
                                                {key.updatedAt !== key.createdAt && (
                                                    <span> • Updated {new Date(key.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(key.provider)}
                                        disabled={revoking === key.provider}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-sm"
                                        title={`Permanently delete ${key.provider} API key`}
                                    >
                                        {revoking === key.provider ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Revoking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Revoke Key</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <strong>Note:</strong> This key is encrypted and stored in Supabase Vault. 
                                        Once revoked, it cannot be recovered. You'll need to add a new key to continue using this integration.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

