import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get('search') || '';

        const memberships = await prisma.organizationMembership.findMany({
            where: {
                userId: userId,
                organization: {
                    name: {
                        contains: searchQuery,
                        mode: 'insensitive',
                    },
                },
            },
            include: {
                organization: true,
            },
            orderBy: {
                organization: {
                    name: 'asc',
                },
            },
        });

        const organizationsWithRoles = memberships.map(membership => ({
            ...membership.organization,
            role: membership.role,
        }));        
        return Response.json(organizationsWithRoles, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}