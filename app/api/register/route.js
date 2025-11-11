import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
 
export async function POST(req) {
    try {
        const { name, email, username, password } = await req.json(); 
        
        if (!name || ! email || !username || !password) {
            return Response.json({ error: "Invalid input. Please Fillup all the field." }, { status: 400 });
        }

        const existingUser = await prisma.User.findUnique({
            where: { email: email }
        });
        if (existingUser) {
            return Response.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.User.create({
            data: {
                name: name,
                email: email,
                username: username,
                password: hashedPassword,
            }
        });
        return Response.json({ message: "User registered successfully!" }, { status: 201 });
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }   
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return Response.json({ error: "Username query parameter is required." }, { status: 400 });
        }

        const existingUser = await prisma.User.findUnique({
            where: { username: username }
        }); 

        if (existingUser) {
            return Response.json({ available: false });
        } else {
            return Response.json({ available: true });
        }
    } catch (error) {
        console.log(error);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}