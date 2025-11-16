async function getAdminIds(tx, orgId) {
    const admins = await tx.organizationMembership.findMany({
        where: { organizationId: orgId, role: 'ADMIN' },
        select: { userId: true },
    });
    return admins.map(a => a.userId);
}

export async function createNotificationForAdmins(tx, orgId, message, links = {}) {
    const adminIds = await getAdminIds(tx, orgId);
    if (adminIds.length > 0) {
        await tx.notification.createMany({
            data: adminIds.map(adminId => ({
                organizationId: orgId,
                recipientId: adminId,
                message,
                ...links,
            })),
        });
    }
}

export async function createNotification(tx, orgId, recipientId, message, links = {}) {
    if (!recipientId) return;
    await tx.notification.create({
        data: {
            organizationId: orgId,
            recipientId,
            message,
            ...links,
        },
    });
}