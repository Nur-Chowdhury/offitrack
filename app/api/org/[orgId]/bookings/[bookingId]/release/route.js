import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookingStatus, UserRole } from "@prisma/client";

export async function PUT(request, context) {
    const { orgId, bookingId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });

        const isOwner = booking.userId === membership.userId;
        const isAdmin = membership.role === UserRole.ADMIN;

        if (!isOwner && !isAdmin) return Response.json({ error: "Forbidden: Not your booking." }, { status: 403 });
        if (![BookingStatus.APPROVED, BookingStatus.IN_USE].includes(booking.status)) return Response.json({ error: "Only active bookings can be released." }, { status: 400 });

        const releasedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                endTime: new Date(),
            }
        });
        return Response.json(releasedBooking, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Server error while releasing resource." }, { status: 500 });
    }
}