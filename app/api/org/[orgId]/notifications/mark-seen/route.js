import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    await prisma.organizationMembership.update({
        where: {
            userId_organizationId: {
                userId: membership.userId,
                organizationId: orgId,
            },
        },
        data: {
            lastSeenNotificationsAt: new Date(),
        },
    });
    return Response.json({ message: "Notifications marked as seen." }, { status: 200 });
}