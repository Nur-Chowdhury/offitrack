import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    const resources = await prisma.resource.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' }
    });
    return Response.json(resources, { status: 200 });
}

export async function POST(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId, [UserRole.ADMIN, UserRole.MEMBER]);
    if (error) return Response.json({ error }, { status });
    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: Admins only." }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, category, type, location, url, quantity } = body;

        if (!name || !category || !type) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newResource = await prisma.resource.create({
            data: { name, category, type, location, url, quantity: quantity|| 1, organizationId: orgId }
        });
        return Response.json(newResource, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Invalid data" }, { status: 400 });
    }
}