import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus, UserRole, AssetCondition  } from "@prisma/client";

export async function PUT(request, context) {
    const { orgId, assignmentId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }

    try {
        const { returnCondition } = await request.json();

        if (!returnCondition || !Object.values(AssetCondition).includes(returnCondition)) {
            return Response.json({ error: "A valid return condition is required." }, { status: 400 });
        }

        const assignment = await prisma.assetAssignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return Response.json({ error: "Assignment not found." }, { status: 404 });
        }

        const isOwner = assignment.userId === membership.userId;
        const isAdmin = membership.role === UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            return Response.json({ error: "Forbidden: You do not have permission to release this asset." }, { status: 403 });
        }

        if (![BookingStatus.APPROVED, BookingStatus.IN_USE].includes(assignment.status)) {
            return Response.json({ error: "This asset is not currently assigned." }, { status: 400 });
        }

        const [releasedAssignment] = await prisma.$transaction([
            prisma.assetAssignment.update({
                where: { id: assignmentId },
                data: {
                    status: BookingStatus.COMPLETED,
                    returnedAt: new Date(),
                }
            }),
            prisma.asset.update({
                where: { id: assignment.assetId },
                data: {
                    condition: returnCondition
                }
            })
        ]);

        return Response.json(releasedAssignment, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Server error." }, { status: 500 });
    }
}