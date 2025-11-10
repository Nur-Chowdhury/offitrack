import { useSession } from "next-auth/react";

export async function POST(req) {
    try {
        const { name } = await req.json();

        const {session} = useSession();

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return Response.json({ error: 'Organization name must be at least 3 characters long' }, { status: 400 });
        }

        const newOrg = await prisma.organization.create({
            data: {
                name: name,
            }
        });
        await prisma.organizationMembership.create({
            data: {
                organizationId: newOrg.id,
                userId: userId,
                role: UserRole.ADMIN,
            }
        });
        return Response.json({ message: "New Organization Created!" }, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}