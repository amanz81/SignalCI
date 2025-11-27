import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, flowConfig, logicConfig } = body;

    const pipeline = await prisma.pipeline.create({
        data: {
            name,
            triggerToken: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(), // Simple unique slug
            flowConfig: flowConfig,
            logicConfig: logicConfig,
            userId: "user_1", // Placeholder
        },
    });

    return NextResponse.json(pipeline);
}
