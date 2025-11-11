import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function authorizeAndGetMembership(orgId) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized", status: 401, membership: null };
    }

    const userId = session.user.id;

    const membership = await prisma.organizationMembership.findUnique({
        where: {
            userId_organizationId: {
                userId: userId,
                organizationId: orgId,
            },
        },
    });

    if (!membership) {
        return { error: "Forbidden: You are not a member of this organization.", status: 403, membership: null };
    }

    return { error: null, status: 200, membership };
}