import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus, UserRole } from "@prisma/client";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    let whereClause = { organizationId: orgId };
    if (membership.role !== UserRole.ADMIN) {
        whereClause.userId = membership.userId;
    }

    const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: { resource: { select: { name: true } }, user: { select: { name: true } } },
        orderBy: { startTime: 'desc' }
    });
    return Response.json(bookings, { status: 200 });
}

export async function POST(request, context) {
    const { orgId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const { resourceId, startTime, endTime, notes } = await request.json();
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (resource.condition !== 'GOOD' && resource.condition !== 'NEW' && resource.condition !== 'USED') {
            return Response.json({ error: `This resource is currently ${resource.condition.toLowerCase()} and cannot be booked.` }, { status: 409 });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return Response.json({ error: "End time must be after start time." }, { status: 400 });
        }

        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                resourceId: resourceId,
                status: { in: [BookingStatus.APPROVED, BookingStatus.IN_USE] },
                startTime: { lt: end },
                endTime: { gt: start },
            }
        });
        if (conflictingBooking) {
            return Response.json({ error: "This resource is already booked during the selected time slot." }, { status: 409 });
        }

        const isAdmin = membership.role === UserRole.ADMIN;
        const bookingStatus = isAdmin ? BookingStatus.APPROVED : BookingStatus.PENDING;

        const newBooking = await prisma.booking.create({
            data: {
                resourceId, notes, startTime: start, endTime: end,
                userId: membership.userId,
                organizationId: orgId,
                status: bookingStatus,
            }
        });
        return Response.json(newBooking, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Invalid data" }, { status: 400 });
    }
}