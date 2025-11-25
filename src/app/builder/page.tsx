"use client";

import React, { useState, useEffect } from 'react';
import PipelineEditor from '@/components/editor/PipelineEditor';
import NodeToolbar from '@/components/editor/NodeToolbar';
import { usePipelineStore } from '@/store/pipelineStore';
import { compilePipeline } from '@/lib/compiler';
import { Button } from '@/components/ui/button';
import { Save, Info, Moon, Sun } from 'lucide-react';

export default function BuilderPage() {
    const { nodes, edges } = usePipelineStore();
    const [saving, setSaving] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) {
            setDarkMode(stored === 'true');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    // Apply dark mode class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

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
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pipeline Builder</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and configure your signal validation pipelines</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Pipeline'}
                    </Button>
                </div>
            </div>

            {/* Three-column layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Node Tools</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to add nodes</p>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <NodeToolbar />
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">How to connect:</p>
                                <p>Drag from the <strong>bottom handle</strong> of one node to the <strong>top handle</strong> of another node.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle - Canvas */}
                <div className="flex-1 flex flex-col bg-slate-100 dark:bg-gray-950">
                    <PipelineEditor darkMode={darkMode} />
                </div>
            </div>
        </div>
    );
}
