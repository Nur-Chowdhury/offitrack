import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole, BookingStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { createNotification } from "@/lib/notifications";

export async function PUT(request, context) {
    const { orgId, assignmentId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }

    if (membership.role !== UserRole.ADMIN) {
        return Response.json({ error: "Forbidden: You do not have permission to manage assignments." }, { status: 403 });
    } 

    try {
        const { newStatus } = await request.json();

        if (newStatus === BookingStatus.APPROVED) {
            const result = await prisma.$transaction(async (tx) => {
                const approvedAssignment = await tx.assetAssignment.update({
                    where: { id: assignmentId },
                    data: {
                        status: BookingStatus.APPROVED,
                        assignedTime: new Date(),
                    },
                });
                await tx.assetAssignment.updateMany({
                    where: {
                        assetId: approvedAssignment.assetId,
                        status: BookingStatus.PENDING,
                        id: { not: assignmentId },
                    },
                    data: {
                        status: BookingStatus.REJECTED,
                    },
                });
                await createNotification(
                    tx,
                    orgId,
                    approvedAssignment.userId,
                    `Your request for "${approvedAssignment.asset.name}" has been approved.`,
                    { relatedAssetId: approvedAssignment.assetId }
                );
                return approvedAssignment;
            });
            return Response.json(result, { status: 200 });
        } else if (newStatus === BookingStatus.REJECTED) {
            const rejectedAssignment = await prisma.assetAssignment.update({
                where: { id: assignmentId },
                data: { status: BookingStatus.REJECTED },
            });
            await createNotification(
                prisma,
                orgId,
                rejectedAssignment.userId,
                `Your request for "${rejectedAssignment.asset.name}" has been rejected.`,
                { relatedAssetId: rejectedAssignment.assetId }
            );
            return Response.json(rejectedAssignment, { status: 200 });
        } else {
            return Response.json({ error: "Invalid status provided." }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: "Assignment not found or invalid data" }, { status: 404 });
    }
}