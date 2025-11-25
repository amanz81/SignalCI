
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ pipelineId: string }> }
) {
    const { pipelineId } = await params;

    // Trigger the Inngest event
    await inngest.send({
        name: "pipeline.triggered",
        data: {
            pipelineId,
            payload: await req.json().catch(() => ({})), // Capture webhook body
        },
    });

    return NextResponse.json({ success: true, message: "Pipeline triggered" });
}
