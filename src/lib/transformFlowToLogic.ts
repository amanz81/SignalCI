import { Node, Edge } from 'reactflow';
import { z } from 'zod';

// Zod schemas for validation
export const NodeDataSchema = z.object({
    duration: z.number().optional(),
    conditionType: z.string().optional(),
    threshold: z.string().optional(),
    operator: z.string().optional(),
    actionType: z.string().optional(),
    message: z.string().optional(),
    searchTerm: z.string().optional(),
    platform: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    timeframe: z.string().optional(),
}).passthrough();

export const LogicStepSchema = z.object({
    id: z.string(),
    type: z.enum(['trigger', 'wait', 'condition', 'action']),
    config: z.record(z.string(), z.any()),
    next: z.array(z.string()).optional(),
    nextTrue: z.string().optional(), // For condition true branch
    nextFalse: z.string().optional(), // For condition false branch
});

export type LogicStep = z.infer<typeof LogicStepSchema>;

/**
 * Transforms React Flow UI state into clean execution logic configuration.
 * 
 * This function converts the messy React Flow JSON (with positions, handles, etc.)
 * into a clean, linear "Step Configuration" that the backend can execute.
 * 
 * @param nodes - React Flow nodes from the UI
 * @param edges - React Flow edges from the UI
 * @returns Clean logic steps array for execution
 */
export function transformFlowToLogic(nodes: Node[], edges: Edge[]): LogicStep[] {
    // Validate nodes have required fields
    if (!nodes || nodes.length === 0) {
        return [];
    }

    // Find the trigger node (must be starting point)
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
        throw new Error('Pipeline must have a trigger node');
    }

    // Build a map of node IDs to nodes for quick lookup
    const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, n]));

    // Build edge maps for efficient traversal
    const outgoingEdges = new Map<string, Edge[]>();
    const incomingEdges = new Map<string, Edge[]>();
    
    edges.forEach(edge => {
        if (!outgoingEdges.has(edge.source)) {
            outgoingEdges.set(edge.source, []);
        }
        outgoingEdges.get(edge.source)!.push(edge);

        if (!incomingEdges.has(edge.target)) {
            incomingEdges.set(edge.target, []);
        }
        incomingEdges.get(edge.target)!.push(edge);
    });

    // Transform each node to a LogicStep
    const steps: LogicStep[] = nodes.map(node => {
        // Validate and clean node data
        let cleanConfig: Record<string, any> = {};
        try {
            if (node.data) {
                const validated = NodeDataSchema.parse(node.data);
                cleanConfig = validated;
            }
        } catch (error) {
            console.warn(`Invalid node data for ${node.id}:`, error);
            cleanConfig = node.data || {};
        }

        // Get outgoing edges for this node
        const nodeEdges = outgoingEdges.get(node.id) || [];

        // Build step configuration
        const step: LogicStep = {
            id: node.id,
            type: (node.type || 'action') as LogicStep['type'],
            config: cleanConfig,
        };

        // Handle different node types
        if (node.type === 'condition') {
            // Conditions have two branches: true and false
            // Check for edge IDs or sourceHandle to determine branch
            const trueEdge = nodeEdges.find(e => 
                e.id === 'true' || 
                e.sourceHandle === 'true' ||
                e.data?.branch === 'true'
            );
            const falseEdge = nodeEdges.find(e => 
                e.id === 'false' || 
                e.sourceHandle === 'false' ||
                e.data?.branch === 'false'
            );

            if (trueEdge) {
                step.nextTrue = trueEdge.target;
            }
            if (falseEdge) {
                step.nextFalse = falseEdge.target;
            }

            // Fallback: if no branch IDs, use first two edges
            if (!trueEdge && !falseEdge && nodeEdges.length > 0) {
                step.nextTrue = nodeEdges[0].target;
                if (nodeEdges.length > 1) {
                    step.nextFalse = nodeEdges[1].target;
                }
            }
        } else {
            // For non-condition nodes, use simple next array
            const nextIds = nodeEdges.map(e => e.target);
            if (nextIds.length > 0) {
                step.next = nextIds;
            }
        }

        return step;
    });

    // Validate all steps
    const validatedSteps = steps.map(step => {
        try {
            return LogicStepSchema.parse(step);
        } catch (error) {
            throw new Error(`Invalid step configuration for ${step.id}: ${error}`);
        }
    });

    return validatedSteps;
}

// Legacy export for backward compatibility
export const compilePipeline = transformFlowToLogic;

