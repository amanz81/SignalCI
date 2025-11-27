import React from 'react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PipelineDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pipeline = await prisma.pipeline.findUnique({
        where: { id },
        include: { executions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });

    if (!pipeline) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Pipeline not found</h1>
                    <Link href="/dashboard" className="text-blue-500 hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-8">
                <div className="mb-6">
                    <Link href="/dashboard" className="text-blue-500 hover:underline mb-2 inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <h1 className="text-3xl font-bold mb-2">{pipeline.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${pipeline.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {pipeline.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-1">Webhook URL:</p>
                        <code className="text-sm font-mono text-blue-600 break-all">
                            {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/webhook/{pipeline.triggerToken}
                        </code>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-semibold">Execution Logs</h2>
                        <p className="text-gray-500 text-sm mt-1">Recent pipeline executions</p>
                    </div>

                    {pipeline.executions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold">Date</th>
                                        <th className="p-4 text-left text-sm font-semibold">Status</th>
                                        <th className="p-4 text-left text-sm font-semibold">Current Step</th>
                                        <th className="p-4 text-left text-sm font-semibold">Logs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pipeline.executions.map((exec) => (
                                        <tr key={exec.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-4 text-sm">{new Date(exec.createdAt).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${exec.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                    exec.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {exec.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">{exec.currentStep}</td>
                                            <td className="p-4">
                                                <pre className="text-xs bg-slate-50 p-2 rounded max-w-md overflow-auto">
                                                    {JSON.stringify(exec.logs, null, 2)}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p className="mb-2">No executions yet</p>
                            <p className="text-sm">Trigger the webhook to see execution logs appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
