"use client";

import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Node,
    Edge,
    Connection,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { usePipelineStore, connectionRules } from '@/store/pipelineStore';
import TriggerNode from './nodes/TriggerNode';
import WaitNode from './nodes/WaitNode';
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';
import NodeConfigPanel from './NodeConfigPanel';
import { X, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface PipelineEditorProps {
    darkMode?: boolean;
}

export default function PipelineEditor({ darkMode = false }: PipelineEditorProps) {
    const nodes = usePipelineStore((state) => state.nodes);
    const edges = usePipelineStore((state) => state.edges);
    const errors = usePipelineStore((state) => state.errors);
    const onNodesChange = usePipelineStore((state) => state.onNodesChange);
    const onEdgesChange = usePipelineStore((state) => state.onEdgesChange);
    const validateAndConnect = usePipelineStore((state) => state.validateAndConnect);
    const deleteEdge = usePipelineStore((state) => state.deleteEdge);
    const clearError = usePipelineStore((state) => state.clearError);
    const setNodes = usePipelineStore((state) => state.setNodes);

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    const nodeTypes = useMemo(() => ({
        trigger: TriggerNode,
        wait: WaitNode,
        condition: ConditionNode,
        action: ActionNode,
    }), []);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setSelectedEdge(null);
    }, []);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
        setSelectedNode(null);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedEdge(null);
    }, []);

    const handleConnect = useCallback((connection: Connection) => {
        validateAndConnect(connection);
    }, [validateAndConnect]);

    const handleDeleteEdge = useCallback(() => {
        if (selectedEdge) {
            deleteEdge(selectedEdge.id);
            setSelectedEdge(null);
        }
    }, [selectedEdge, deleteEdge]);

    const handleConfigSave = useCallback((newData: any) => {
        if (selectedNode) {
            const updatedNodes = nodes.map((n) =>
                n.id === selectedNode.id ? { ...n, data: newData } : n
            );
            setNodes(updatedNodes);
            setSelectedNode({ ...selectedNode, data: newData } as Node);
        }
    }, [selectedNode, nodes, setNodes]);

    // Check if a connection is valid (for visual feedback)
    const isValidConnection = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target) return false;
        if (connection.source === connection.target) return false;

        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) return false;

        const sourceType = sourceNode.type as keyof typeof connectionRules;
        const targetType = targetNode.type as keyof typeof connectionRules;
        const sourceRules = connectionRules[sourceType];
        const targetRules = connectionRules[targetType];

        // Target can't receive input
        if (targetRules.maxInputs === 0) return false;

        // Check max outputs
        const currentOutputs = edges.filter(e => e.source === connection.source).length;
        if (currentOutputs >= sourceRules.maxOutputs) return false;

        // Check max inputs
        const currentInputs = edges.filter(e => e.target === connection.target).length;
        if (currentInputs >= targetRules.maxInputs) return false;

        // Check if can connect to target type
        if (!sourceRules.canConnectTo.includes(targetType)) return false;

        return true;
    }, [nodes, edges]);

    // Style edges - highlight selected edge
    const styledEdges = edges.map(edge => ({
        ...edge,
        style: {
            ...edge.style,
            stroke: selectedEdge?.id === edge.id ? '#ef4444' : '#3b82f6',
            strokeWidth: selectedEdge?.id === edge.id ? 3 : 2,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: selectedEdge?.id === edge.id ? '#ef4444' : '#3b82f6',
        },
    }));

    return (
        <div className="flex-1 flex overflow-hidden relative">
            {/* Error Toast Container */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2">
                {errors.map((error) => (
                    <div
                        key={error.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
                            error.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-amber-500 text-white'
                        }`}
                    >
                        {error.type === 'error' ? (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{error.message}</span>
                        <button
                            onClick={() => clearError(error.id)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Selected Edge Delete Button */}
            {selectedEdge && (
                <div className="absolute top-4 right-[340px] z-50">
                    <button
                        onClick={handleDeleteEdge}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete Connection</span>
                    </button>
                </div>
            )}

            {/* Canvas */}
            <div className="flex-1 relative">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={styledEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={handleConnect}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        isValidConnection={isValidConnection}
                        fitView
                        className={darkMode ? "bg-gray-900" : "bg-slate-50"}
                        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                        defaultEdgeOptions={{ 
                            style: { stroke: '#3b82f6', strokeWidth: 2 },
                            type: 'smoothstep',
                            animated: true,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#3b82f6',
                            },
                        }}
                        snapToGrid={true}
                        snapGrid={[15, 15]}
                        connectionRadius={40}
                    >
                        <Background color={darkMode ? "#374151" : "#cbd5e1"} gap={16} />
                        <Controls className={darkMode ? "bg-gray-800 border-gray-700 shadow-lg [&>button]:bg-gray-800 [&>button]:border-gray-700 [&>button]:text-gray-300 [&>button:hover]:bg-gray-700" : "bg-white border shadow-lg"} />
                        <MiniMap 
                            className={darkMode ? "bg-gray-800 border-gray-700 shadow-lg" : "bg-white border shadow-lg"}
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case 'trigger': return '#10b981';
                                    case 'wait': return '#f59e0b';
                                    case 'condition': return '#3b82f6';
                                    case 'action': return '#8b5cf6';
                                    default: return '#6b7280';
                                }
                            }}
                            maskColor={darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.1)"}
                        />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg flex flex-col">
                {selectedNode ? (
                    <NodeConfigPanel
                        nodeId={selectedNode.id}
                        nodeType={selectedNode.type || ''}
                        nodeData={selectedNode.data}
                        onClose={() => setSelectedNode(null)}
                        onSave={handleConfigSave}
                    />
                ) : selectedEdge ? (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Connection</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click to delete or press Delete key</p>
                        </div>
                        <div className="flex-1 p-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                                    Selected connection from <strong>{selectedEdge.source}</strong> to <strong>{selectedEdge.target}</strong>
                                </p>
                                <button
                                    onClick={handleDeleteEdge}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Connection
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center text-gray-400 dark:text-gray-500">
                                <div className="text-4xl mb-4">📋</div>
                                <p className="text-sm font-medium">Select a node to configure</p>
                                <p className="text-xs mt-2">Click on any node or connection in the canvas</p>
                            </div>
                        </div>
                        {/* Connection Rules Help */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Connection Rules</h3>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li>• <span className="text-green-600">Trigger</span>: 0 in, 1 out (start)</li>
                                <li>• <span className="text-amber-600">Wait</span>: 1 in, 1 out</li>
                                <li>• <span className="text-blue-600">Condition</span>: 1 in, 2 out</li>
                                <li>• <span className="text-purple-600">Action</span>: 1 in, 1 out</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
