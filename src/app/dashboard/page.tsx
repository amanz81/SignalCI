import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { getWebhookUrl } from '@/lib/webhookUrl';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const pipelines = await prisma.pipeline.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-500 hover:underline mb-2 inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="flex justify-between items-center mb-6" data-tour="dashboard-header">
                    <div>
                        <h1 className="text-3xl font-bold">Your Pipelines</h1>
                        <p className="text-gray-500 mt-1">Manage and monitor your signal validation pipelines</p>
                    </div>
                    <Link href="/builder">
                        <Button data-tour="dashboard-create">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Pipeline
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4">
                    {pipelines.map((pipeline, index) => (
                        <div key={pipeline.id} className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow" data-tour={index === 0 ? "dashboard-pipeline" : undefined}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2">{pipeline.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${pipeline.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {pipeline.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span>Created {new Date(pipeline.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border">
                                        <p className="text-xs text-gray-500 mb-1">Webhook URL:</p>
                                        <code className="text-sm font-mono text-blue-600 break-all">
                                            {getWebhookUrl(pipeline.triggerToken, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Link href={`/pipelines/${pipeline.id}`}>
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Logs
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pipelines.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-lg border">
                            <div className="text-gray-400 mb-4">
                                <Plus className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No pipelines yet</h3>
                            <p className="text-gray-500 mb-4">Create your first pipeline to get started!</p>
                            <Link href="/builder">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Pipeline
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
