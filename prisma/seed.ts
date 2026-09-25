import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const createAdmin = async () => {
    try {

        const email = process.env.ADMIN_EMAIL;
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: "ADMIN",
            },
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            throw new Error("The admin email is already registered as another user.");
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 12);

        const admin = await prisma.user.create({
            data: {
                username: "admin",
                fullName: "KisanApp Administrator",
                email: email as string,
                password: hashedPassword,
                role: "ADMIN",
                providerType: "EMAIL",
                isEmailVerified: true,
            },
        });

        console.log("Admin created successfully:");
        console.log(admin.email);

    } catch (error) {
        console.error("Admin creation failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

createAdmin();