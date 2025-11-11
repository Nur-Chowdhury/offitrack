import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole, BookingStatus } from "@prisma/client";

export async function POST(req, { params }) {
    const { orgId, assetId } = params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);

    if (error) {
        return Response.json({ error }, { status });
    }
    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to assign assets." }, { status: 403 });
    }

    try {
        const { userId, notes } = await req.json();
        const assignment = await prisma.assetAssignment.create({
            data: {
                assetId,
                userId,
                notes,
                assignedTime: new Date(),
                status: BookingStatus.IN_USE,
                organizationId: orgId,
            }
        });
        return Response.json(assignment, { status: 201 });
    } catch (e) {
        return Response.json({ error: "Invalid data. Ensure user and asset exist." }, { status: 400 });
    }
}