import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            });
            if (!user) throw new Error("User not found");

            const isValid = await bcrypt.compare(
            credentials.password,
            user.password
            );
            if (!isValid) throw new Error("Invalid credentials");

            return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            };
        },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60,
        updateAge: 60 * 15,
    },
    callbacks: {
        async session({ session, token }) {
        session.user = {
            id: token.id,
            username: token.username,
            role: token.role ?? "user",
        };
        return session;
        },
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.username = user.username;
            token.role = user.role;
        }
        return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/admin/login",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
