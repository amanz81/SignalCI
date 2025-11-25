import { inngest } from "./client";

export const pipelineTriggered = inngest.createFunction(
    { id: "pipeline-triggered" },
    { event: "pipeline.triggered" },
    async ({ event, step }) => {
        // Placeholder logic for now
        await step.run("log-start", async () => {
            console.log(`Pipeline ${event.data.pipelineId} triggered`);
            return { message: "Pipeline started" };
        });

        // In the future, we will load the pipeline config and iterate steps
        return { status: "completed" };
    }
);
