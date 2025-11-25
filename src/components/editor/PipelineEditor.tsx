"use client";

import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Node,
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

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const nodeTypes = useMemo(() => ({
        trigger: TriggerNode,
        wait: WaitNode,
        condition: ConditionNode,
        action: ActionNode,
    }), []);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const handleConfigSave = useCallback((newData: any) => {
        if (selectedNode) {
            const updatedNodes = nodes.map((n) =>
                n.id === selectedNode.id ? { ...n, data: newData } : n
            );
            setNodes(updatedNodes);
            // Update selected node data
            setSelectedNode({ ...selectedNode, data: newData } as Node);
        }
    }, [selectedNode, nodes, setNodes]);

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Canvas */}
            <div className="flex-1 relative">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-slate-50"
                        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                        defaultEdgeOptions={{ 
                            style: { stroke: '#3b82f6', strokeWidth: 2 },
                            type: 'smoothstep',
                            animated: true
                        }}
                    >
                        <Background color="#cbd5e1" gap={16} />
                        <Controls className="bg-white border shadow-lg" />
                        <MiniMap 
                            className="bg-white border shadow-lg"
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case 'trigger': return '#10b981';
                                    case 'wait': return '#f59e0b';
                                    case 'condition': return '#3b82f6';
                                    case 'action': return '#8b5cf6';
                                    default: return '#6b7280';
                                }
                            }}
                        />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-80 bg-white border-l shadow-lg flex flex-col">
                {selectedNode ? (
                    <NodeConfigPanel
                        nodeId={selectedNode.id}
                        nodeType={selectedNode.type || ''}
                        nodeData={selectedNode.data}
                        onClose={() => setSelectedNode(null)}
                        onSave={handleConfigSave}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center text-gray-400">
                            <div className="text-4xl mb-4">📋</div>
                            <p className="text-sm font-medium">Select a node to configure</p>
                            <p className="text-xs mt-2">Click on any node in the canvas to view and edit its properties</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
