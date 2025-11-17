import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole, MaintenanceStatus, AssetCondition } from "@prisma/client";
import { createNotification, createNotificationForAdmins } from "@/lib/notifications";

export async function PUT(request, context) {
    const { orgId, logId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    const logToComplete = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
    if (!logToComplete) return Response.json({ error: "Log not found." }, { status: 404 });

    if (membership.role !== UserRole.ADMIN && logToComplete.maintainedById !== membership.userId) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    try {
        const { cost, details } = await request.json();

        let itemName;
        
        const completedLog = await prisma.$transaction(async (tx) => {
            if (logToComplete.assetId) {
                const asset = await tx.asset.update({ 
                    where: { id: logToComplete.assetId }, 
                    data: { condition: AssetCondition.GOOD } 
                });
                itemName = asset.name;
            }
            if (logToComplete.resourceId) {
                const resource = await tx.resource.update({ 
                    where: { id: logToComplete.resourceId }, 
                    data: { condition: AssetCondition.GOOD } 
                });
                itemName = resource.itemName;
            }
            if (logToComplete.reportedById) {
                await createNotification(tx, orgId, logToComplete.reportedById, `The maintenance issue for "${itemName}" has been resolved.`);
            }
            await createNotificationForAdmins(
                tx, 
                orgId, 
                `The maintenance issue for "${itemName}" has been resolved.`, 
                { relatedMaintenanceId: logToComplete.id }
            );
            return tx.maintenanceLog.update({
                where: { id: logId },
                data: {
                    cost: parseFloat(cost) || 0,
                    details,
                    status: MaintenanceStatus.COMPLETED,
                    completedAt: new Date(),
                }
            });
        });

        return Response.json(completedLog, { status: 200 });
    } catch (e) {
        console.log(e);
        
        return Response.json({ error: "Failed to complete task." }, { status: 500 });
    }
}