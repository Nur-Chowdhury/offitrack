import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AssetCondition, BookingStatus } from "@prisma/client";
import { createNotification, createNotificationForAdmins } from "@/lib/notifications";

export async function POST(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const { assetId, resourceId, details } = await request.json();
        if ((!assetId && !resourceId) || !details) {
            return Response.json({ error: "An item ID and details are required." }, { status: 400 });
        }

        const newLog = await prisma.$transaction(async (tx) => {
            if (assetId) {
                const asset = await tx.asset.update({ where: { id: assetId }, data: { condition: AssetCondition.DAMAGED } });
                itemName = asset.name;
                const assignmentsToCancel = await tx.assetAssignment.findMany({ where: { assetId, status: { in: ['APPROVED', 'IN_USE'] } } });
                for (const assignment of assignmentsToCancel) {
                    await createNotification(
                        tx, 
                        orgId, 
                        assignment.userId, 
                        `Your assignment for "${itemName}" has been cancelled because the item was reported as damaged.`
                    );
                }
                await tx.assetAssignment.deleteMany({ where: { assetId, status: { in: ['PENDING', 'APPROVED', 'IN_USE'] } } });
            }
            if (resourceId) {
                const resource = await tx.resource.update({ where: { id: resourceId }, data: { condition: AssetCondition.DAMAGED } });
                itemName = resource.name;
                const bookingsToCancel = await tx.booking.findMany({ where: { resourceId, status: { in: ['APPROVED', 'IN_USE'] } } });
                for (const booking of bookingsToCancel) {
                    await createNotification(
                        tx, 
                        orgId, 
                        booking.userId, 
                        `Your booking for "${itemName}" has been cancelled because the item was reported as damaged.`
                    );
                }
                await tx.booking.deleteMany({ where: { resourceId, status: { in: ['PENDING', 'APPROVED', 'IN_USE'] } } });
            }
            const maintenanceData = {
                details,
                organization: {
                    connect: { id: orgId }
                },
                reportedBy: {
                    connect: { id: membership.userId }
                }
            };

            if (assetId) {
                maintenanceData.asset = {
                    connect: { id: assetId }
                };
            } else if (resourceId) {
                maintenanceData.resource = {
                    connect: { id: resourceId }
                };
            }
            await createNotificationForAdmins(
                tx, 
                orgId, 
                `A new maintenance issue was reported for: ${itemName}.`, 
                { relatedMaintenanceId: log.id }
            );
            
            return tx.maintenanceLog.create({
                data: maintenanceData
            });
        });

        return Response.json(newLog, { status: 201 });
    } catch (e) {
        return Response.json({ error: "Failed to report issue." }, { status: 500 });
    }
}