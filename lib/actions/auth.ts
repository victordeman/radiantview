"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { signOut } from "@/auth";

export async function registerUser(values: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  try {
    const { email, password, name, role } = values;

    if (!email || !password || !name || !role) {
      return { error: "All fields are required." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already in use!" };
    }

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
      },
    });

    return { success: "User created!" };
  } catch (error) {
    console.error("[REGISTER_USER]", error);
    return { error: "Registration failed. Please try again later." };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
