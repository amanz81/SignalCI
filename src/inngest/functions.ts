import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { LogicStep } from "@/lib/compiler";

// Helper to log execution steps
async function logStep(executionId: string, stepName: string, status: 'PENDING' | 'SUCCESS' | 'FAILED', details: any) {
    const execution = await prisma.execution.findUnique({ where: { id: executionId } });
    if (!execution) return;

    const logs = (execution.logs as any[]) || [];
    logs.push({
        step: stepName,
        status,
        details,
        timestamp: new Date().toISOString()
    });

    await prisma.execution.update({
        where: { id: executionId },
        data: {
            logs,
            status: status === 'FAILED' ? 'FAILED' : 'PENDING' // Don't auto-complete here
        }
    });
}

export const pipelineTriggered = inngest.createFunction(
    { id: "pipeline-triggered" },
    { event: "pipeline.triggered" },
    async ({ event, step }) => {
        const { pipelineId, payload } = event.data;

        // 1. Load Pipeline & Create Execution Record
        const { pipeline, executionId } = await step.run("load-pipeline", async () => {
            const pipeline = await prisma.pipeline.findUnique({
                where: { id: pipelineId }
            });

            if (!pipeline || !pipeline.isActive) {
                throw new Error("Pipeline not found or inactive");
            }

            const execution = await prisma.execution.create({
                data: {
                    pipelineId,
                    status: "RUNNING",
                    currentStep: 0,
                    logs: [{ step: "Trigger", status: "SUCCESS", details: payload, timestamp: new Date().toISOString() }]
                }
            });

            return { pipeline, executionId: execution.id };
        });

        // 2. Parse Logic Config
        const steps = pipeline.logicConfig as unknown as LogicStep[];

        // Find the trigger node (start point)
        const triggerNode = steps.find(s => s.type === 'trigger');
        if (!triggerNode) {
            await step.run("log-error", async () => {
                await logStep(executionId, "Initialization", "FAILED", "No trigger node found");
            });
            return { status: "failed", message: "No trigger node found" };
        }

        // 3. Graph Traversal & Execution
        // We'll use a recursive function to traverse, but since Inngest steps must be flat/linear or use step.invoke,
        // we'll implement a linear execution queue for this version.
        // NOTE: For complex branching, we would need to be more sophisticated.
        // For now, we assume a linear path or simple branching where we follow the first valid path.

        let currentNodeId: string | undefined = triggerNode.next?.[0];

        while (currentNodeId) {
            const currentNode = steps.find(s => s.id === currentNodeId);
            if (!currentNode) break;

            // Execute the current step
            const result: any = await step.run(`execute-${currentNode.type}-${currentNode.id}`, async () => {
                // Log start
                await logStep(executionId, `Start ${currentNode.type}`, "PENDING", {});

                // Execute logic based on type
                switch (currentNode.type) {
                    case 'wait':
                        // We handle wait separately outside step.run for Inngest sleep
                        return { action: 'wait', duration: currentNode.config.duration || 10 };

                    case 'condition':
                        // Mock condition check
                        // In real app, this would check volume, RSI, etc.
                        const conditionType = currentNode.config.conditionType || 'volume';
                        const threshold = currentNode.config.threshold;
                        console.log(`Checking condition: ${conditionType} ${threshold}`);

                        // Mock logic: 80% chance of success for demo
                        const passed = Math.random() > 0.2;
                        return {
                            action: 'condition',
                            passed,
                            details: passed ? "Condition met" : "Condition failed"
                        };

                    case 'action':
                        // Mock action execution
                        const actionType = currentNode.config.actionType || 'telegram';
                        console.log(`Executing action: ${actionType}`);
                        return { action: 'action', success: true, details: `Sent ${actionType} alert` };

                    default:
                        return { action: 'unknown' };
                }
            });

            // Handle Wait (Sleep)
            if (result.action === 'wait') {
                await step.sleep(`wait-${currentNode.id}`, `${result.duration}s`);
                await step.run(`log-wait-${currentNode.id}`, async () => {
                    await logStep(executionId, "Wait", "SUCCESS", `Waited ${result.duration}s`);
                });
            }

            // Handle Condition
            if (result.action === 'condition') {
                await step.run(`log-condition-${currentNode.id}`, async () => {
                    await logStep(executionId, "Condition", result.passed ? "SUCCESS" : "FAILED", result.details);
                });

                if (!result.passed) {
                    // Stop execution if condition failed
                    // In future: support 'false' branch
                    await step.run("finish-failed", async () => {
                        await prisma.execution.update({
                            where: { id: executionId },
                            data: { status: "FAILED" }
                        });
                    });
                    return { status: "failed", reason: "Condition failed" };
                }
            }

            // Handle Action
            if (result.action === 'action') {
                await step.run(`log-action-${currentNode.id}`, async () => {
                    await logStep(executionId, "Action", "SUCCESS", result.details);
                });
            }

            // Move to next node
            // For conditions, we currently assume 'true' path is index 0
            // In future, we need to map true/false outputs to specific indices
            currentNodeId = currentNode.next?.[0];
        }

        // 4. Complete Execution
        await step.run("finish-success", async () => {
            await prisma.execution.update({
                where: { id: executionId },
                data: { status: "SUCCESS" }
            });
        });

        return { status: "completed", executionId };
    }
);
