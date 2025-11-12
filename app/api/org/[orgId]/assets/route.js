import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(req, context) {
    const { orgId } = await context.params;
    const { error, status } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }

    try {
        const assets = await prisma.asset.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' }
        });

        return Response.json(assets, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }

    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to create assets." }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, type, purchaseDate, condition } = body;

        if (!name || !type || !purchaseDate || !condition) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newAsset = await prisma.asset.create({
            data: {
                name,
                type,
                purchaseDate: new Date(purchaseDate),
                condition,
                organizationId: orgId
            }
        });

        return Response.json(newAsset, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}