import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    const notifications = await prisma.notification.findMany({
        where: {
            organizationId: orgId,
            recipientId: membership.userId,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return Response.json(notifications, { status: 200 });
}