import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { validatePayloadSecret } from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Legacy webhook endpoint using pipeline ID
 * Route: /api/webhook/{pipelineId}
 * 
 * Note: The preferred endpoint is /api/webhook/v1/{token} for better security.
 * This endpoint is kept for backward compatibility.
 * 
 * Security layers:
 * 1. Pipeline ID lookup
 * 2. Payload secret validation (if configured)
 * 3. Rate limiting (10 req/10s per IP/Pipeline)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ pipelineId: string }> }
) {
    const { pipelineId } = await params;

    // 1. Rate Limiting (Anti-DDoS)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    const rateLimitKey = `${pipelineId}:${clientIp}`;
    
    const rateLimitResult = await checkRateLimit(rateLimitKey);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { 
                success: false, 
                error: "Rate limit exceeded",
                retryAfter: rateLimitResult.reset 
            },
            { status: 429 }
        );
    }

    // 2. Find Pipeline by ID
    const pipeline = await prisma.pipeline.findUnique({
        where: { id: pipelineId },
    });

    if (!pipeline) {
        // Don't reveal if token exists - security best practice
        return NextResponse.json(
            { success: false, error: "Invalid token" },
            { status: 404 }
        );
    }

    if (!pipeline.isActive) {
        return NextResponse.json(
            { success: false, error: "Pipeline is inactive" },
            { status: 403 }
        );
    }

    // 3. Payload Secret Validation
    let payload: any;
    try {
        payload = await req.json();
    } catch {
        payload = {};
    }

    if (!validatePayloadSecret(payload, pipeline.signalSecret)) {
        return NextResponse.json(
            { success: false, error: "Invalid payload secret" },
            { status: 401 }
        );
    }

    // 4. Trigger Inngest Event (with userId for tenant isolation)
    await inngest.send({
        name: "pipeline.triggered",
        data: {
            pipelineId: pipeline.id,
            userId: pipeline.userId, // Critical for tenant isolation
            payload,
        },
    });

    return NextResponse.json({ 
        success: true, 
        message: "Pipeline triggered",
        // Include rate limit headers
        headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        }
    });
}
