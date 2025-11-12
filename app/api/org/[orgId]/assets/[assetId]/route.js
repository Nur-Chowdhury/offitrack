import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(req, context) {
    const { orgId, assetId } = await context.params;
    const { error, status } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }

    try {
        const asset = await prisma.asset.findFirst({
            where: { id: assetId, organizationId: orgId },
            include: { assignments: { include: { user: { select: { name: true } } } } }
        });
        if (!asset) {
            return Response.json({ error: "Asset not found" }, { status: 404 });
        }
        return Response.json(asset, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req, context) {
    const { orgId, assetId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }
    if (![UserRole.ADMIN, UserRole.MAINTENANCE_STAFF].includes(membership.role)) {
        return Response.json({ error: "Forbidden: You do not have permission to update assets." }, { status: 403 });
    }
    try {
        const body = await req.json();
        const updatedAsset = await prisma.asset.update({
            where: { id: assetId, organizationId: orgId },
            data: { ...body }
        });
        return Response.json(updatedAsset, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Asset not found or invalid data" }, { status: 404 });
    }
}

export async function DELETE(req, context) {
    const { orgId, assetId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }
    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to delete assets." }, { status: 403 });
    }

    try {
        await prisma.asset.delete({
            where: { id: assetId, organizationId: orgId }
        });
        return Response.json({ message: "Asset deleted successfully" }, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Asset not found" }, { status: 404 });
    }
}