import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AssetCondition, BookingStatus } from "@prisma/client";

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
                await tx.asset.update({ where: { id: assetId }, data: { condition: AssetCondition.DAMAGED } });
                await tx.assetAssignment.deleteMany({
                    where: { assetId: assetId, status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_USE] } }
                });
            }
            if (resourceId) {
                await tx.resource.update({ where: { id: resourceId }, data: { condition: AssetCondition.DAMAGED } });
                await tx.booking.deleteMany({
                    where: { resourceId: resourceId, status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_USE] } }
                });
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

            return tx.maintenanceLog.create({
                data: maintenanceData
            });
        });

        return Response.json(newLog, { status: 201 });
    } catch (e) {
        console.error(e);
        return Response.json({ error: "Failed to report issue." }, { status: 500 });
    }
}