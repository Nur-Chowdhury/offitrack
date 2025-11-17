import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                createdAt: true,
                _count: {
                    select: {
                        memberships: true,
                    },
                },
            }
        });
        if (!user) {
            return Response.json({ error: "User not found." }, { status: 404 });
        }
        const { _count, ...userDetails } = user;
        const responseData = {
            ...userDetails,
            orgCnt: _count.memberships,
        };
        return Response.json(responseData, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Server error." }, { status: 500 });
    }
}