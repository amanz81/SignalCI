import { Node, Edge } from 'reactflow';
import { transformFlowToLogic, LogicStep } from '../transformFlowToLogic';

describe('transformFlowToLogic', () => {
    it('should transform a simple linear pipeline', () => {
        const nodes: Node[] = [
            {
                id: 'trigger-1',
                type: 'trigger',
                position: { x: 0, y: 0 },
                data: {},
            },
            {
                id: 'wait-1',
                type: 'wait',
                position: { x: 100, y: 0 },
                data: { duration: 10 },
            },
            {
                id: 'action-1',
                type: 'action',
                position: { x: 200, y: 0 },
                data: { actionType: 'telegram', message: 'Alert!' },
            },
        ];

        const edges: Edge[] = [
            { id: 'e1', source: 'trigger-1', target: 'wait-1' },
            { id: 'e2', source: 'wait-1', target: 'action-1' },
        ];

        const result = transformFlowToLogic(nodes, edges);

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({
            id: 'trigger-1',
            type: 'trigger',
            next: ['wait-1'],
        });
        expect(result[1]).toMatchObject({
            id: 'wait-1',
            type: 'wait',
            config: { duration: 10 },
            next: ['action-1'],
        });
        expect(result[2]).toMatchObject({
            id: 'action-1',
            type: 'action',
            config: { actionType: 'telegram', message: 'Alert!' },
        });
    });

    it('should handle condition nodes with true/false branches', () => {
        const nodes: Node[] = [
            {
                id: 'trigger-1',
                type: 'trigger',
                position: { x: 0, y: 0 },
                data: {},
            },
            {
                id: 'condition-1',
                type: 'condition',
                position: { x: 100, y: 0 },
                data: { conditionType: 'volume', threshold: '1000000' },
            },
            {
                id: 'action-true',
                type: 'action',
                position: { x: 200, y: -50 },
                data: { actionType: 'telegram' },
            },
            {
                id: 'action-false',
                type: 'action',
                position: { x: 200, y: 50 },
                data: { actionType: 'email' },
            },
        ];

        const edges: Edge[] = [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'action-true', id: 'true' },
            { id: 'e3', source: 'condition-1', target: 'action-false', id: 'false' },
        ];

        const result = transformFlowToLogic(nodes, edges);

        const conditionStep = result.find(s => s.id === 'condition-1');
        expect(conditionStep).toBeDefined();
        expect(conditionStep?.nextTrue).toBe('action-true');
        expect(conditionStep?.nextFalse).toBe('action-false');
    });

    it('should throw error if no trigger node exists', () => {
        const nodes: Node[] = [
            {
                id: 'wait-1',
                type: 'wait',
                position: { x: 0, y: 0 },
                data: {},
            },
        ];

        const edges: Edge[] = [];

        expect(() => transformFlowToLogic(nodes, edges)).toThrow('Pipeline must have a trigger node');
    });

    it('should return empty array for empty nodes', () => {
        const result = transformFlowToLogic([], []);
        expect(result).toEqual([]);
    });

    it('should validate and clean node data', () => {
        const nodes: Node[] = [
            {
                id: 'trigger-1',
                type: 'trigger',
                position: { x: 0, y: 0 },
                data: {},
            },
            {
                id: 'wait-1',
                type: 'wait',
                position: { x: 100, y: 0 },
                data: {
                    duration: 15,
                    invalidField: 'should be filtered',
                },
            },
        ];

        const edges: Edge[] = [
            { id: 'e1', source: 'trigger-1', target: 'wait-1' },
        ];

        const result = transformFlowToLogic(nodes, edges);

        const waitStep = result.find(s => s.id === 'wait-1');
        expect(waitStep?.config.duration).toBe(15);
        // Invalid fields should still pass through (passthrough mode)
        expect(waitStep?.config.invalidField).toBe('should be filtered');
    });

    it('should handle condition with fallback to first two edges', () => {
        const nodes: Node[] = [
            {
                id: 'trigger-1',
                type: 'trigger',
                position: { x: 0, y: 0 },
                data: {},
            },
            {
                id: 'condition-1',
                type: 'condition',
                position: { x: 100, y: 0 },
                data: { conditionType: 'price' },
            },
            {
                id: 'action-1',
                type: 'action',
                position: { x: 200, y: -50 },
                data: {},
            },
            {
                id: 'action-2',
                type: 'action',
                position: { x: 200, y: 50 },
                data: {},
            },
        ];

        const edges: Edge[] = [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'action-1' },
            { id: 'e3', source: 'condition-1', target: 'action-2' },
        ];

        const result = transformFlowToLogic(nodes, edges);

        const conditionStep = result.find(s => s.id === 'condition-1');
        expect(conditionStep?.nextTrue).toBe('action-1');
        expect(conditionStep?.nextFalse).toBe('action-2');
    });
});

