"use client";

import React, { useState } from 'react';
import PipelineEditor from '@/components/editor/PipelineEditor';
import NodeToolbar from '@/components/editor/NodeToolbar';
import { usePipelineStore } from '@/store/pipelineStore';
import { compilePipeline } from '@/lib/compiler';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export default function BuilderPage() {
    const { nodes, edges } = usePipelineStore();
    const [saving, setSaving] = useState(false);
    const [showHelp, setShowHelp] = useState(true);

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
        <div className="p-4 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Pipeline Builder</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowHelp(!showHelp)}>
                        <Info className="w-4 h-4 mr-2" />
                        {showHelp ? 'Hide' : 'Show'} Help
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Pipeline'}
                    </Button>
                </div>
            </div>

            {showHelp && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-900">Quick Guide:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click toolbar buttons to add nodes to the canvas</li>
                        <li>• <strong>Drag from a node's bottom circle to another node's top circle</strong> to connect them</li>
                        <li>• <strong>Double-click a node</strong> to configure its parameters (duration, conditions, etc.)</li>
                        <li>• Drag nodes to rearrange your pipeline</li>
                        <li>• Click Save when ready to create your pipeline</li>
                    </ul>
                </div>
            )}

            <NodeToolbar />
            <div className="mt-4 flex-1">
                <PipelineEditor />
            </div>
        </div>
    );
}
