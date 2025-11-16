import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('search') || '';

        const organizations = await prisma.$queryRaw`
            SELECT
                o.id,
                o.name,
                om.role,
                (SELECT COUNT(*)
                    FROM "Notification" n
                    WHERE n."recipientId" = ${userId}
                        AND n."organizationId" = o.id
                        AND n."createdAt" > COALESCE(om."lastSeenNotificationsAt", '1970-01-01'))::int AS "unseenCount"
            FROM "Organization" o
            JOIN "OrganizationMembership" om ON o.id = om."organizationId"
            WHERE om."userId" = ${userId}
              AND o.name ILIKE ${'%' + searchQuery + '%'}
            ORDER BY o.name ASC;
        `;

        return Response.json(organizations, { status: 200 });
    } catch (error) {
        console.error("Error fetching organizations with counts:", error);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}