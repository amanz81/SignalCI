"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock, GitBranch, Send } from 'lucide-react';
import { usePipelineStore } from '@/store/pipelineStore';

export default function NodeToolbar() {
    const { nodes, setNodes } = usePipelineStore();

    const addNode = (type: string) => {
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {},
        };
        setNodes([...nodes, newNode]);
    };

    return (
        <div className="flex gap-2 p-4 bg-white border rounded-lg shadow-sm">
            <Button onClick={() => addNode('trigger')} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Trigger
            </Button>
            <Button onClick={() => addNode('wait')} variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Wait
            </Button>
            <Button onClick={() => addNode('condition')} variant="outline" size="sm">
                <GitBranch className="w-4 h-4 mr-2" />
                Condition
            </Button>
            <Button onClick={() => addNode('action')} variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Action
            </Button>
        </div>
    );
}
