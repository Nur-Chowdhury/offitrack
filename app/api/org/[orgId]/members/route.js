import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }

    const members = await prisma.organizationMembership.findMany({
        where: { organizationId: orgId },
        include: {
            user: { select: { id: true, name: true, email: true } }
        },
        orderBy: {
            user: {
                name: 'asc'
            }
        }
    });

    return Response.json(members, { status: 200 });
}

export async function POST(req, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    
    if (error) {
        return Response.json({ error }, { status });
    }
    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to add members." }, { status: 403 });
    }

    try {
        const { email, role } = await req.json();
        const userToAdd = await prisma.user.findUnique({ where: { email } });

        if (!userToAdd) {
            return Response.json({ error: "User with this email does not exist." }, { status: 404 });
        }

        const newMember = await prisma.organizationMembership.create({
            data: {
                userId: userToAdd.id,
                organizationId: orgId,
                role: role || UserRole.EMPLOYEE,
            }
        });
        return Response.json(newMember, { status: 201 });

    } catch(e) {
        if (e.code === 'P2002') {
            return Response.json({ error: "User is already a member of this organization." }, { status: 409 });
        }
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}