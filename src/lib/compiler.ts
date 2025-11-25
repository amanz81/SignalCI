import { Node, Edge } from 'reactflow';

export type LogicStep = {
    id: string;
    type: 'trigger' | 'wait' | 'condition' | 'action';
    config: any;
    next?: string[]; // IDs of next steps
};

export function compilePipeline(nodes: Node[], edges: Edge[]): LogicStep[] {
    // Simple compilation: map nodes to steps and link them via edges
    const steps: LogicStep[] = nodes.map((node) => {
        const nextNodes = edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => edge.target);

        return {
            id: node.id,
            type: node.type as any,
            config: node.data,
            next: nextNodes,
        };
    });

    return steps;
}
