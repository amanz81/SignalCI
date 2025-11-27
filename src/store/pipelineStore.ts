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

        // Rule 7: MVP Constraint - Check max steps limit (10 steps excluding trigger)
        const nonTriggerNodes = nodes.filter(n => n.type !== 'trigger');
        // If adding this connection would create a new node path, check the limit
        // Note: This is a simplified check - we're checking total non-trigger nodes
        if (nonTriggerNodes.length >= 10) {
            addError('Maximum of 10 steps reached (excluding trigger). This limit prevents infinite loops and protects serverless costs.');
            return false;
        }

        // Rule 8: Prevent circular connections (basic check)
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

        if (nodes.length === 0) {
            return errors; // Empty pipeline is valid
        }

        // Rule 0: MVP Constraint - Max 10 steps (excluding trigger)
        // This prevents infinite loops and serverless budget drain
        const nonTriggerNodes = nodes.filter(n => n.type !== 'trigger');
        if (nonTriggerNodes.length > 10) {
            errors.push({
                id: 'max-steps-exceeded',
                message: `Pipeline exceeds maximum of 10 steps (currently ${nonTriggerNodes.length}). This limit prevents infinite loops and protects serverless costs.`,
                type: 'error',
                timestamp: Date.now(),
            });
        }

        // Rule 1: Detection pipeline must start with a Trigger (data source)
        const triggers = nodes.filter(n => n.type === 'trigger');
        if (triggers.length === 0) {
            errors.push({
                id: 'no-trigger',
                message: 'Detection pipeline must start with a Trigger (data source)',
                type: 'error',
                timestamp: Date.now(),
            });
        }

        // Rule 2: Must have at least one Action (alert/notification)
        const actions = nodes.filter(n => n.type === 'action');
        if (actions.length === 0) {
            errors.push({
                id: 'no-action',
                message: 'Detection pipeline must have at least one Action (alert) - what should happen when conditions are met?',
                type: 'error',
                timestamp: Date.now(),
            });
        }

        // Rule 3: Every execution path must eventually reach an Action
        // (DFS from each trigger to ensure all paths end at actions)
        const validatePathEndsInAction = (startNodeId: string, visited = new Set<string>()): boolean => {
            if (visited.has(startNodeId)) return true; // Cycle detected, skip
            visited.add(startNodeId);

            const node = nodes.find(n => n.id === startNodeId);
            if (!node) return false;

            // If we reached an action, this path is valid
            if (node.type === 'action') return true;

            // If node has no outputs, path doesn't end in action
            const outgoingEdges = edges.filter(e => e.source === startNodeId);
            if (outgoingEdges.length === 0) {
                return false;
            }

            // Check all output paths
            return outgoingEdges.every(edge => {
                // For conditions, check both true and false branches
                if (node.type === 'condition') {
                    const trueBranch = edges.find(e => e.source === startNodeId && e.id === 'true');
                    const falseBranch = edges.find(e => e.source === startNodeId && e.id === 'false');
                    
                    const trueValid = trueBranch ? validatePathEndsInAction(trueBranch.target, new Set(visited)) : false;
                    const falseValid = falseBranch ? validatePathEndsInAction(falseBranch.target, new Set(visited)) : false;
                    
                    return trueValid && falseValid;
                }
                
                return validatePathEndsInAction(edge.target, new Set(visited));
            });
        };

        triggers.forEach(trigger => {
            if (!validatePathEndsInAction(trigger.id)) {
                errors.push({
                    id: `path-no-action-${trigger.id}`,
                    message: 'Not all execution paths lead to an Action. Every detection must eventually trigger an alert.',
                    type: 'error',
                    timestamp: Date.now(),
                });
            }
        });

        // Rule 4: Check for disconnected nodes (except triggers)
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

        // Rule 5: Triggers must have outputs
        triggers.forEach(trigger => {
            const hasOutput = edges.some(e => e.source === trigger.id);
            if (!hasOutput) {
                errors.push({
                    id: `trigger-no-output-${trigger.id}`,
                    message: 'Trigger is not connected to any detection logic',
                    type: 'error',
                    timestamp: Date.now(),
                });
            }
        });

        // Rule 6: Conditions should have both true/false branches configured (best practice)
        const conditions = nodes.filter(n => n.type === 'condition');
        conditions.forEach(condition => {
            const conditionEdges = edges.filter(e => e.source === condition.id);
            
            if (conditionEdges.length === 0) {
                errors.push({
                    id: `condition-no-branches-${condition.id}`,
                    message: 'Condition has no branches configured. Add connections for both true and false paths.',
                    type: 'warning',
                    timestamp: Date.now(),
                });
            } else if (conditionEdges.length === 1) {
                errors.push({
                    id: `condition-partial-branches-${condition.id}`,
                    message: 'Condition should have both true and false branches for complete detection logic.',
                    type: 'warning',
                    timestamp: Date.now(),
                });
            }
            // If 2+ edges, condition has both branches (good)
        });

        // Rule 7: Multiple triggers are allowed (multiple data sources)
        if (triggers.length > 1) {
            errors.push({
                id: 'multiple-triggers',
                message: `Multiple triggers detected (${triggers.length}). Each trigger creates a separate detection pipeline. Consider splitting into separate pipelines.`,
                type: 'warning',
                timestamp: Date.now(),
            });
        }

        // Rule 8: Check for potential infinite loops (circular paths)
        // This is a safety check beyond the max steps limit
        const hasCircularPath = (startNodeId: string, visited = new Set<string>(), path = new Set<string>()): boolean => {
            if (path.has(startNodeId)) return true; // Circular path detected
            if (visited.has(startNodeId)) return false; // Already checked this node
            
            visited.add(startNodeId);
            path.add(startNodeId);
            
            const outgoingEdges = edges.filter(e => e.source === startNodeId);
            for (const edge of outgoingEdges) {
                if (hasCircularPath(edge.target, visited, new Set(path))) {
                    return true;
                }
            }
            
            return false;
        };

        triggers.forEach(trigger => {
            if (hasCircularPath(trigger.id)) {
                errors.push({
                    id: `circular-path-${trigger.id}`,
                    message: 'Circular path detected. This could create an infinite loop. Remove circular connections.',
                    type: 'error',
                    timestamp: Date.now(),
                });
            }
        });

        return errors;
    },
}));
