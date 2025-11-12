import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function DELETE(request, context) {
    const { orgId, resourceId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to delete resources." }, { status: 403 });
    }

    try {
        await prisma.$transaction([
            prisma.booking.deleteMany({
                where: { resourceId: resourceId }
            }),
            prisma.resource.delete({
                where: { id: resourceId, organizationId: orgId }
            })
        ]);
        return Response.json({ message: "Resource deleted successfully." }, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Resource not found or failed to delete." }, { status: 404 });
    }
}