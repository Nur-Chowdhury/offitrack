import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return Response.json({ error: "All fields are required." }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return Response.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return Response.json({ error: "User not found." }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return Response.json({ error: "Incorrect current password." }, { status: 403 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedNewPassword },
        });

        return Response.json({ message: "Password updated successfully." }, { status: 200 });

    } catch (error) {
        return Response.json({ error: "Server error." }, { status: 500 });
    }
}