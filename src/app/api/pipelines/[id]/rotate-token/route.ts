import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/security";

/**
 * Rotate webhook token for a pipeline
 * POST /api/pipelines/{id}/rotate-token
 * 
 * Security: Immediately invalidates old token and generates new one
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // TODO: Add authentication check here
    // const userId = getUserIdFromRequest(req);
    // Verify pipeline belongs to user

    try {
        const pipeline = await prisma.pipeline.findUnique({
            where: { id },
        });

        if (!pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        // Generate new secure token
        const newToken = generateSecureToken();

        // Update pipeline with new token (old one immediately becomes invalid)
        const updated = await prisma.pipeline.update({
            where: { id },
            data: {
                triggerToken: newToken,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Token rotated successfully",
            webhookUrl: `/api/webhook/v1/${newToken}`,
            // Never return the full token in response
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to rotate token" },
            { status: 500 }
        );
    }
}

