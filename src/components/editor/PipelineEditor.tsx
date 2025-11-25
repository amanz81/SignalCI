"use client";

import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { usePipelineStore } from '@/store/pipelineStore';
import TriggerNode from './nodes/TriggerNode';
import WaitNode from './nodes/WaitNode';
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';
import NodeConfigPanel from './NodeConfigPanel';

export default function PipelineEditor() {
    const nodes = usePipelineStore((state) => state.nodes);
    const edges = usePipelineStore((state) => state.edges);
    const onNodesChange = usePipelineStore((state) => state.onNodesChange);
    const onEdgesChange = usePipelineStore((state) => state.onEdgesChange);
    const onConnect = usePipelineStore((state) => state.onConnect);
    const setNodes = usePipelineStore((state) => state.setNodes);

    const [selectedNode, setSelectedNode] = useState<any>(null);

    const nodeTypes = useMemo(() => ({
        trigger: TriggerNode,
        wait: WaitNode,
        condition: ConditionNode,
        action: ActionNode,
    }), []);

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: any) => {
        setSelectedNode(node);
    }, []);

    const handleConfigSave = useCallback((newData: any) => {
        if (selectedNode) {
            const updatedNodes = nodes.map((n) =>
                n.id === selectedNode.id ? { ...n, data: newData } : n
            );
            setNodes(updatedNodes);
        }
    }, [selectedNode, nodes, setNodes]);

    return (
        <>
            <div className="h-[600px] w-full border rounded-lg bg-background">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDoubleClick={onNodeDoubleClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            {selectedNode && (
                <NodeConfigPanel
                    nodeId={selectedNode.id}
                    nodeType={selectedNode.type}
                    nodeData={selectedNode.data}
                    onClose={() => setSelectedNode(null)}
                    onSave={handleConfigSave}
                />
            )}
        </>
    );
}
