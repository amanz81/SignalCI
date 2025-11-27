import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteApiKey } from "@/lib/vault";

/**
 * Revoke (delete) an API key for a pipeline
 * DELETE /api/pipelines/{id}/revoke-key
 * 
 * Body: { provider: string }
 * 
 * Security: Immediately deletes the key from Vault and database
 * This is the "big red button" for when users think their key is compromised
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // TODO: Add authentication check here
    // const userId = getUserIdFromRequest(req);
    // Verify pipeline belongs to user

    try {
        const body = await req.json();
        const { provider } = body;

        if (!provider) {
            return NextResponse.json(
                { error: "Provider is required" },
                { status: 400 }
            );
        }

        const pipeline = await prisma.pipeline.findUnique({
            where: { id },
        });

        if (!pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found" },
                { status: 404 }
            );
        }

        // Delete from Vault and database
        await deleteApiKey(id, provider);

        return NextResponse.json({
            success: true,
            message: `API key for ${provider} has been permanently revoked and deleted from Vault`,
        });
    } catch (error) {
        console.error("Error revoking API key:", error);
        return NextResponse.json(
            { error: "Failed to revoke API key" },
            { status: 500 }
        );
    }
}

