import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus, UserRole } from "@prisma/client";
import { createNotification, createNotificationForAdmins } from "@/lib/notifications";

export async function POST(request, context) {
    const { orgId, assetId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) {
        return Response.json({ error }, { status });
    }
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (asset.condition !== 'GOOD' && asset.condition !== 'NEW' && asset.condition !== 'USED') {
        return Response.json({ error: `This asset is currently ${asset.condition.toLowerCase()} and cannot be requested.` }, { status: 409 });
    }
    console.log(membership.userId);
    const member = await prisma.user.findUnique({where: {id: membership.userId}})
    try {
        const { notes } = await request.json();
        const isAdmin = membership.role === UserRole.ADMIN;
        console.log(notes, isAdmin, orgId, assetId);
        if (isAdmin) {
            const result = await prisma.$transaction(async (tx) => {
                const adminAssignment = await tx.assetAssignment.create({
                    data: {
                        notes: notes || "Admin auto-assignment",
                        assetId: assetId,
                        userId: membership.userId,
                        organizationId: orgId,
                        status: BookingStatus.APPROVED,
                        assignedTime: new Date(),
                    }
                }); 
                await tx.assetAssignment.updateMany({
                    where: {
                        assetId: assetId,
                        status: BookingStatus.PENDING,
                    },
                    data: {
                        status: BookingStatus.REJECTED,
                    },
                });
                return adminAssignment;
            });
            console.log(result);
            return Response.json(result, { status: 201 });
        }
        const newAssignmentRequest = await prisma.assetAssignment.create({
            data: {
                notes: notes||"",
                assetId: assetId,
                userId: membership.userId,
                organizationId: orgId,
                status: BookingStatus.PENDING,
            }
        });
        if (!isAdmin) {
            await createNotificationForAdmins(
                prisma,
                orgId,
                `${member.name} has requested the asset: ${asset.name}.`,
                { relatedAssetId: assetId }
            );
        }
        return Response.json(newAssignmentRequest, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}