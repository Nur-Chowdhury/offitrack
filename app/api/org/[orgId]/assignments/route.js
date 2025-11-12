import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }

    let whereClause = { organizationId: orgId };

    if (membership.role !== 'ADMIN') {
        whereClause.userId = membership.userId;
    }

    const assignments = await prisma.assetAssignment.findMany({
        where: whereClause,
        include: {
            user: { select: { name: true, email: true } },
            asset: { select: { name: true, type: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return Response.json(assignments, { status: 200 });
}