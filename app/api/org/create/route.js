import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from '@prisma/client';

export async function POST(req) {
    try {
        const { name } = await req.json();

        const session = await getServerSession(authOptions); 

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
        console.log(error);
        
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}