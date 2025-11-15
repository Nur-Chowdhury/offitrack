import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    const lastSeen = membership.lastSeenNotificationsAt || new Date(0);

    const count = await prisma.notification.count({
        where: {
            organizationId: orgId,
            recipientId: membership.userId,
            createdAt: {
                gt: lastSeen,
            },
        },
    });

    return Response.json({ count }, { status: 200 });
}