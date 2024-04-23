'use server'

import { db } from "@/db"
import { User, users } from "@/db/schemas"
import { eq } from "drizzle-orm";


export const getUserByEmail = async (email: string) => {
    const user = await db.select().from(users).where(eq(users.email, email));

    return user[0];
}

export const createNewUser = async (user:User) => {
    try {
        await db.insert(users).values({ ...user });
    } catch (error) {
        console.log(error)
    }
}