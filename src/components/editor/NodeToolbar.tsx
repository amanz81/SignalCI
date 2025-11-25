"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock, GitBranch, Send } from 'lucide-react';
import { usePipelineStore } from '@/store/pipelineStore';

const nodeTypes = [
    {
        type: 'trigger',
        label: 'Trigger',
        icon: Play,
        color: 'bg-green-500',
        description: 'Starts the pipeline when webhook is called'
    },
    {
        type: 'wait',
        label: 'Wait',
        icon: Clock,
        color: 'bg-amber-500',
        description: 'Pause execution for a duration'
    },
    {
        type: 'condition',
        label: 'Condition',
        icon: GitBranch,
        color: 'bg-blue-500',
        description: 'Check conditions before proceeding'
    },
    {
        type: 'action',
        label: 'Action',
        icon: Send,
        color: 'bg-purple-500',
        description: 'Send notification or execute action'
    }
];

export default function NodeToolbar() {
    const { nodes, setNodes } = usePipelineStore();

    const addNode = (type: string) => {
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
            data: {},
        };
        setNodes([...nodes, newNode]);
    };

    return (
        <div className="space-y-3">
            {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                    <button
                        key={nodeType.type}
                        onClick={() => addNode(nodeType.type)}
                        className="w-full p-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${nodeType.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{nodeType.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{nodeType.description}</div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
