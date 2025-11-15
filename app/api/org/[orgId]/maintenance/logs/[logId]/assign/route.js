import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole, MaintenanceStatus, AssetCondition } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export async function PUT(request, context) {
    const { orgId, logId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });
    if (membership.role !== UserRole.ADMIN) return Response.json({ error: "Forbidden." }, { status: 403 });

    try {
        const { staffId } = await request.json();
        if (!staffId) return Response.json({ error: "Staff ID is required." }, { status: 400 });

        const logToUpdate = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
        if (!logToUpdate) return Response.json({ error: "Log not found." }, { status: 404 });
        
        const updatedLog = await prisma.$transaction(async (tx) => {
            if (logToUpdate.assetId) {
                await tx.asset.update({ where: { id: logToUpdate.assetId }, data: { condition: AssetCondition.IN_REPAIR } });
            }
            if (logToUpdate.resourceId) {
                await tx.resource.update({ where: { id: logToUpdate.resourceId }, data: { condition: AssetCondition.IN_REPAIR } });
            }
            return tx.maintenanceLog.update({
                where: { id: logId },
                data: {
                    maintainedById: staffId,
                    status: MaintenanceStatus.ASSIGNED,
                }
            });
        });
        await createNotification(
            prisma, 
            orgId, 
            staffId, 
            `You have been assigned a new maintenance task for: ${itemName}.`, 
            { relatedMaintenanceId: logId }
        );
        if (logToUpdate.reportedById) {
            await createNotification(
                prisma, 
                orgId, 
                logToUpdate.reportedById, 
                `Maintenance for "${itemName}" has been assigned to a staff member.`
            );
        }
        return Response.json(updatedLog, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Failed to assign staff." }, { status: 500 });
    }
}