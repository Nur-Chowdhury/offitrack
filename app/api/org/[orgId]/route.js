import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;

    const { error, status } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
        });

        if (!organization) {
            return Response.json({ error: "Organization not found." }, { status: 404 });
        }

        return Response.json(organization, { status: 200 });
    } catch (e) {
        return Response.json({ error: "Server error." }, { status: 500 });
    }
}