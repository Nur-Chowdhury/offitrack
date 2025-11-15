import prisma from "@/lib/prisma"; 

async function emitNotificationViaWebSocket(recipientId, notification) {
    const socketServerUrl = `${process.env.SOCKET_SERVER_URL}/api/notify` || 'http://localhost:3001/api/notify';
    try {
        await fetch(socketServerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientId, notification }),
        });
    } catch (error) {
        console.error("Failed to emit WebSocket notification:", error.message);
    }
}

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
        const notifications = await Promise.all(
            adminIds.map(adminId => tx.notification.create({
                data: { organizationId: orgId, recipientId: adminId, message, ...links },
            }))
        );
        notifications.forEach(notif => emitNotificationViaWebSocket(notif.recipientId, notif));
    }
}

export async function createNotification(tx, orgId, recipientId, message, links = {}) {
    if (!recipientId) return;
    const notification = await tx.notification.create({
        data: { organizationId: orgId, recipientId, message, ...links },
    });
    emitNotificationViaWebSocket(recipientId, notification);
}
