import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole, BookingStatus } from "@prisma/client";

export async function PUT(request, context) {
    const { orgId, bookingId } = await context.params;
    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const { newStatus } = await request.json();
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });

        const isAdmin = membership.role === UserRole.ADMIN;
        const isOwner = booking.userId === membership.userId;

        if ((newStatus === BookingStatus.APPROVED || newStatus === BookingStatus.REJECTED) && !isAdmin) {
            return Response.json({ error: "Forbidden: Admins only for this action." }, { status: 403 });
        }
        if (newStatus === BookingStatus.CANCELLED && !isOwner && !isAdmin) {
            return Response.json({ error: "Forbidden: You can only cancel your own bookings." }, { status: 403 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus }
        });
        return Response.json(updatedBooking, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Operation failed." }, { status: 500 });
    }
}