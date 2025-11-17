import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    const logs = await prisma.maintenanceLog.findMany({
        where: { organizationId: orgId },
        include: {
            asset: { select: { name: true } },
            resource: { select: { name: true } },
            reportedBy: { select: { name: true } },
            maintainedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' }
    });    

    return Response.json(logs, { status: 200 });
}