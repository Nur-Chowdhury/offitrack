import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function PUT(req, context) {
    const { orgId, userId } = await context.params;
    const { error, status, membership: adminMembership } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }
    if (adminMembership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to change member roles." }, { status: 403 });
    }

    if (adminMembership.userId === userId) {
        const adminCount = await prisma.organizationMembership.count({
            where: {
                organizationId: orgId,
                role: UserRole.ADMIN,
            },
        });
        if (adminCount <= 1) {
             return Response.json({ error: "Cannot change role. You are the only administrator." }, { status: 400 });
        }
    }

    try {
        const { role } = await req.json();
        if (!Object.values(UserRole).includes(role)) {
            return Response.json({ error: "Invalid role specified." }, { status: 400 });
        }
        
        const updatedMembership = await prisma.organizationMembership.update({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: orgId,
                },
            },
            data: {
                role: role,
            },
        });
        return Response.json(updatedMembership, { status: 200 });
    } catch (e) {
        console.error(e);
        return Response.json({ error: "Failed to update member role. Member may not exist." }, { status: 404 });
    }
}