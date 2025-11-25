import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

// Connection rules for each node type
export const connectionRules = {
    trigger: {
        maxInputs: 0,
        maxOutputs: 1,
        canConnectTo: ['wait', 'condition', 'action'],
        label: 'Trigger',
    },
    wait: {
        maxInputs: 1,
        maxOutputs: 1,
        canConnectTo: ['wait', 'condition', 'action'],
        label: 'Wait',
    },
    condition: {
        maxInputs: 1,
        maxOutputs: 2, // true/false branches
        canConnectTo: ['wait', 'condition', 'action'],
        label: 'Condition',
    },
    action: {
        maxInputs: 1,
        maxOutputs: 1, // can chain to another action
        canConnectTo: ['wait', 'condition', 'action'],
        label: 'Action',
    },
};

export type ValidationError = {
    id: string;
    message: string;
    type: 'error' | 'warning';
    timestamp: number;
};

type PipelineState = {
    nodes: Node[];
    edges: Edge[];
    errors: ValidationError[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    validateAndConnect: (connection: Connection) => boolean;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    deleteEdge: (edgeId: string) => void;
    addError: (message: string, type?: 'error' | 'warning') => void;
    clearError: (id: string) => void;
    clearAllErrors: () => void;
    validatePipeline: () => ValidationError[];
};

export const usePipelineStore = create<PipelineState>((set, get) => ({
    nodes: [],
    edges: [],
    errors: [],

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    validateAndConnect: (connection: Connection) => {
        const { nodes, edges, addError } = get();
        
        if (!connection.source || !connection.target) {
            addError('Invalid connection: missing source or target');
            return false;
        }

        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) {
            addError('Invalid connection: node not found');
            return false;
        }

        const sourceType = sourceNode.type as keyof typeof connectionRules;
        const targetType = targetNode.type as keyof typeof connectionRules;
        const sourceRules = connectionRules[sourceType];
        const targetRules = connectionRules[targetType];

        // Rule 1: Can't connect to self
        if (connection.source === connection.target) {
            addError('Cannot connect a node to itself');
            return false;
        }

        // Rule 2: Check if connection already exists
        const existingEdge = edges.find(
            e => e.source === connection.source && e.target === connection.target
        );
        if (existingEdge) {
            addError('Connection already exists');
            return false;
        }

        // Rule 3: Check if target can receive inputs (trigger can't)
        if (targetRules.maxInputs === 0) {
            addError(`${targetRules.label} cannot receive connections - it must be the starting point`);
            return false;
        }

        // Rule 4: Check max outputs from source
        const currentOutputs = edges.filter(e => e.source === connection.source).length;
        if (currentOutputs >= sourceRules.maxOutputs) {
            addError(`${sourceRules.label} can only have ${sourceRules.maxOutputs} outgoing connection(s)`);
            return false;
        }

        // Rule 5: Check max inputs to target
        const currentInputs = edges.filter(e => e.target === connection.target).length;
        if (currentInputs >= targetRules.maxInputs) {
            addError(`${targetRules.label} can only have ${targetRules.maxInputs} incoming connection(s)`);
            return false;
        }

        // Rule 6: Check if source can connect to target type
        if (!sourceRules.canConnectTo.includes(targetType)) {
            addError(`${sourceRules.label} cannot connect to ${targetRules.label}`);
            return false;
        }

        // Rule 7: Prevent circular connections (basic check)
        const wouldCreateCycle = (source: string, target: string, visited = new Set<string>()): boolean => {
            if (source === target) return true;
            if (visited.has(target)) return false;
            visited.add(target);
            
            const outgoingEdges = edges.filter(e => e.source === target);
            for (const edge of outgoingEdges) {
                if (wouldCreateCycle(source, edge.target, visited)) {
                    return true;
                }
            }
            return false;
        };

        if (wouldCreateCycle(connection.source, connection.target)) {
            addError('Cannot create circular connection - this would create an infinite loop');
            return false;
        }

        // All validations passed - add the edge
        set({
            edges: addEdge(
                {
                    ...connection,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#3b82f6', strokeWidth: 2 },
                },
                edges
            ),
        });

        return true;
    },

    setNodes: (nodes: Node[]) => set({ nodes }),
    setEdges: (edges: Edge[]) => set({ edges }),

    deleteEdge: (edgeId: string) => {
        set({
            edges: get().edges.filter(e => e.id !== edgeId),
        });
    },

    addError: (message: string, type: 'error' | 'warning' = 'error') => {
        const error: ValidationError = {
            id: `error-${Date.now()}`,
            message,
            type,
            timestamp: Date.now(),
        };
        set({ errors: [...get().errors, error] });

        // Auto-clear after 5 seconds
        setTimeout(() => {
            get().clearError(error.id);
        }, 5000);
    },

    clearError: (id: string) => {
        set({ errors: get().errors.filter(e => e.id !== id) });
    },

    clearAllErrors: () => {
        set({ errors: [] });
    },

    validatePipeline: () => {
        const { nodes, edges } = get();
        const errors: ValidationError[] = [];

        // Check if there's at least one trigger
        const triggers = nodes.filter(n => n.type === 'trigger');
        if (triggers.length === 0 && nodes.length > 0) {
            errors.push({
                id: 'no-trigger',
                message: 'Pipeline needs a Trigger node as a starting point',
                type: 'warning',
                timestamp: Date.now(),
            });
        }

        // Check if there's at least one action
        const actions = nodes.filter(n => n.type === 'action');
        if (actions.length === 0 && nodes.length > 0) {
            errors.push({
                id: 'no-action',
                message: 'Pipeline needs at least one Action node',
                type: 'warning',
                timestamp: Date.now(),
            });
        }

        // Check for disconnected nodes (except triggers)
        nodes.forEach(node => {
            if (node.type !== 'trigger') {
                const hasInput = edges.some(e => e.target === node.id);
                if (!hasInput) {
                    errors.push({
                        id: `disconnected-${node.id}`,
                        message: `${connectionRules[node.type as keyof typeof connectionRules]?.label || 'Node'} is not connected to the pipeline`,
                        type: 'warning',
                        timestamp: Date.now(),
                    });
                }
            }
        });

        // Check for triggers with no output
        triggers.forEach(trigger => {
            const hasOutput = edges.some(e => e.source === trigger.id);
            if (!hasOutput) {
                errors.push({
                    id: `trigger-no-output-${trigger.id}`,
                    message: 'Trigger is not connected to any node',
                    type: 'warning',
                    timestamp: Date.now(),
                });
            }
        });

        return errors;
    },
}));
