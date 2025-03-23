import { prismaAdapter } from "better-auth/adapters/prisma"
import { betterAuth } from "better-auth"
import prismadb from "./lib/prismadb"

export const auth = betterAuth({
    database: prismaAdapter(prismadb, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true
    }
})