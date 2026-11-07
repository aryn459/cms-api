import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV != "production"){
    globalForPrisma.prisma = prisma;
}

export async function connectDatabase(){
    await prisma.$connect();
    console.log("Database Successfully Connected");
}

export async function disconnectDatabase(){
    await prisma.$disconnect();
    console.log("Database Successfully Disconnected");
}