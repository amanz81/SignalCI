import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { LogicStep } from "@/lib/transformFlowToLogic";
import { Prisma } from "@prisma/client";
import { Integrations } from "@/integrations/IntegrationManager";

// Types for execution logs
type ExecutionLog = {
    step: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    details: unknown;
    timestamp: string;
};

// Helper to log execution steps
async function logStep(executionId: string, stepName: string, status: 'PENDING' | 'SUCCESS' | 'FAILED', details: unknown) {
    const execution = await prisma.execution.findUnique({ where: { id: executionId } });
    if (!execution) return;

    const logs = (execution.logs as ExecutionLog[]) || [];
    logs.push({
        step: stepName,
        status,
        details,
        timestamp: new Date().toISOString()
    });

    await prisma.execution.update({
        where: { id: executionId },
        data: {
            logs: logs as Prisma.InputJsonValue, // Cast to satisfy Prisma Json type
            status: status === 'FAILED' ? 'FAILED' : 'PENDING' // Don't auto-complete here
        }
    });
}

export const pipelineTriggered = inngest.createFunction(
    { 
        id: "pipeline-triggered",
        // Global timeout for entire function execution (5 minutes)
        // Note: Inngest v3 uses timeouts.start and timeouts.finish
        timeouts: {
            start: "5m", // Maximum time for function to start
            finish: "5m", // Maximum time for function to complete
        },
    },
    { event: "pipeline.triggered" },
    async ({ event, step }) => {
        const { pipelineId, payload, userId } = event.data;

        // 0. TENANT ISOLATION: Validate userId matches pipeline owner
        const { pipeline, executionId } = await step.run("validate-tenant", async () => {
            const pipeline = await prisma.pipeline.findUnique({
                where: { id: pipelineId }
            });

            if (!pipeline) {
                throw new Error("Pipeline not found");
            }

            // CRITICAL: Tenant isolation check
            if (pipeline.userId !== userId) {
                throw new Error(
                    `Tenant isolation violation: Event userId (${userId}) does not match pipeline owner (${pipeline.userId})`
                );
            }

            if (!pipeline.isActive) {
                throw new Error("Pipeline is inactive");
            }

            const execution = await prisma.execution.create({
                data: {
                    pipelineId,
                    status: "RUNNING",
                    currentStep: 0,
                    logs: [{ 
                        step: "Trigger", 
                        status: "SUCCESS", 
                        details: payload, 
                        timestamp: new Date().toISOString() 
                    }]
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

            // Execute the current step with timeout protection
            type StepResult = 
                | { action: 'wait'; duration: number }
                | { action: 'condition'; passed: boolean; details: string }
                | { action: 'action'; success: boolean; details: string }
                | { action: 'unknown' };

            const result = await step.run(
                `execute-${currentNode.type}-${currentNode.id}`,
                async () => {
                    // Log start
                    await logStep(executionId, `Start ${currentNode.type}`, "PENDING", {});

                    // Execute logic based on type
                    switch (currentNode.type) {
                        case 'wait':
                            // We handle wait separately outside step.run for Inngest sleep
                            return { action: 'wait', duration: currentNode.config.duration || 10 };

                        case 'condition':
                            // Real condition check using IntegrationManager
                            const conditionType = currentNode.config.conditionType || 'price';
                            const threshold = parseFloat(currentNode.config.threshold || '0');
                            const operator = currentNode.config.operator || 'gt'; // gt, lt, eq, gte, lte
                            const asset = currentNode.config.asset || 'bitcoin';
                            const metricSource = currentNode.config.metricSource || 'coingecko';
                            const metricName = currentNode.config.metricName || conditionType;

                            try {
                                // Fetch actual metric value from integration layer
                                const actualValue = await Integrations.getMetricValue(
                                    metricSource,
                                    asset,
                                    metricName
                                );

                                // Evaluate condition based on operator
                                let passed = false;
                                switch (operator.toLowerCase()) {
                                    case 'gt':
                                    case 'greater':
                                        passed = actualValue > threshold;
                                        break;
                                    case 'gte':
                                    case 'greater_or_equal':
                                        passed = actualValue >= threshold;
                                        break;
                                    case 'lt':
                                    case 'less':
                                        passed = actualValue < threshold;
                                        break;
                                    case 'lte':
                                    case 'less_or_equal':
                                        passed = actualValue <= threshold;
                                        break;
                                    case 'eq':
                                    case 'equal':
                                        passed = Math.abs(actualValue - threshold) < 0.01; // Small tolerance for floats
                                        break;
                                    default:
                                        passed = actualValue > threshold; // Default to greater than
                                }

                                const details = `${asset} ${metricName}: ${actualValue} ${operator} ${threshold} = ${passed}`;
                                
                                return {
                                    action: 'condition',
                                    passed,
                                    details
                                };
                            } catch (error) {
                                // Log error but don't crash - mark condition as failed
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                                console.error(`Condition check failed: ${errorMessage}`);
                                return {
                                    action: 'condition',
                                    passed: false,
                                    details: `Condition check failed: ${errorMessage}`
                                };
                            }

                        case 'action':
                            // Real action execution using IntegrationManager
                            const actionType = currentNode.config.actionType || 'telegram';
                            const message = currentNode.config.message || 'SignalCI Alert';
                            const target = currentNode.config.target || currentNode.config.chatId || '';
                            
                            try {
                                // Send notification through integration layer
                                await Integrations.notify(actionType, target, message, {
                                    parseMode: currentNode.config.parseMode,
                                    disablePreview: currentNode.config.disablePreview,
                                });

                                return {
                                    action: 'action',
                                    success: true,
                                    details: `Sent ${actionType} notification to ${target}`
                                };
                            } catch (error) {
                                // Log error but continue execution
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                                console.error(`Action execution failed: ${errorMessage}`);
                                return {
                                    action: 'action',
                                    success: false,
                                    details: `Failed to send ${actionType} notification: ${errorMessage}`
                                };
                            }

                        default:
                            return { action: 'unknown' as const };
                    }
                }
            ) as StepResult;

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
                    const status = result.success ? "SUCCESS" : "FAILED";
                    await logStep(executionId, "Action", status, result.details);
                    
                    // If action failed critically, mark execution as failed
                    if (!result.success) {
                        await prisma.execution.update({
                            where: { id: executionId },
                            data: { status: "FAILED" }
                        });
                    }
                });
                
                // Stop execution if action failed
                if (!result.success) {
                    return { status: "failed", reason: "Action execution failed" };
                }
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
