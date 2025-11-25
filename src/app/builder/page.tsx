"use client";

import React, { useState } from 'react';
import PipelineEditor from '@/components/editor/PipelineEditor';
import NodeToolbar from '@/components/editor/NodeToolbar';
import { usePipelineStore } from '@/store/pipelineStore';
import { compilePipeline } from '@/lib/compiler';
import { Button } from '@/components/ui/button';
import { Save, Info } from 'lucide-react';

export default function BuilderPage() {
    const { nodes, edges } = usePipelineStore();
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const logicConfig = compilePipeline(nodes, edges);
        const flowConfig = { nodes, edges };

        try {
            const res = await fetch('/api/pipelines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Pipeline ${new Date().toLocaleString()}`,
                    flowConfig,
                    logicConfig,
                }),
            });
            if (res.ok) {
                alert('Pipeline saved!');
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pipeline Builder</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and configure your signal validation pipelines</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Pipeline'}
                </Button>
            </div>

            {/* Three-column layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-64 bg-white border-r shadow-sm flex flex-col">
                    <div className="p-4 border-b bg-slate-50">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Node Tools</h2>
                        <p className="text-xs text-gray-500 mt-1">Click to add nodes</p>
                    </div>
                    <div className="flex-1 p-4">
                        <NodeToolbar />
                    </div>
                    <div className="p-4 border-t bg-blue-50">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800">
                                <p className="font-semibold mb-1">How to connect:</p>
                                <p>Drag from the <strong>bottom handle</strong> of one node to the <strong>top handle</strong> of another node.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle - Canvas */}
                <div className="flex-1 flex flex-col bg-slate-100">
                    <PipelineEditor />
                </div>
            </div>
        </div>
    );
}
