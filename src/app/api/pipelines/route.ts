import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/security";
import { z } from "zod";

const CreatePipelineSchema = z.object({
    name: z.string().min(1),
    flowConfig: z.any(),
    logicConfig: z.any(),
    signalSecret: z.string().optional(), // Optional payload secret
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, flowConfig, logicConfig, signalSecret } = CreatePipelineSchema.parse(body);

        // Generate secure 32-byte random token
        const triggerToken = generateSecureToken();

        const pipeline = await prisma.pipeline.create({
            data: {
                name,
                triggerToken, // Secure random token instead of predictable slug
                signalSecret: signalSecret || null,
                flowConfig: flowConfig,
                logicConfig: logicConfig,
                userId: "user_1", // Placeholder - replace with actual auth
            },
        });

        return NextResponse.json({
            ...pipeline,
            // Don't expose the full token in response for security
            webhookUrl: `/api/webhook/v1/${triggerToken}`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create pipeline" },
            { status: 500 }
        );
    }
}
