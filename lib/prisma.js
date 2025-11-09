import { PrismaClient } from '@prisma/client';

let prisma;

// This is to prevent creating new connections in development with Next.js hot reloading.
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;