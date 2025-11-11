import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(req, { params }) {
    const { orgId } = params;
    const { error, status } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const assets = await prisma.asset.findMany({
            where: { organizationId: orgId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return Response.json(assets, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    const { orgId } = params;
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