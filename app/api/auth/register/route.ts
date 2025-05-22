"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt
const MIN_PASSWORD_LENGTH = 8;

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // --- Input Validation ---
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Email, contraseña y confirmación de contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido." },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }
    
    // Optional: Name validation (e.g., if provided, not empty)
    if (name && typeof name === 'string' && name.trim().length === 0) {
        return NextResponse.json(
            { error: "El nombre no puede estar vacío si se proporciona." },
            { status: 400 }
        );
    }


    // --- Check for Existing User ---
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Store and check email in lowercase
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email." },
        { status: 409 } // 409 Conflict
      );
    }

    // --- Hash Password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Create User ---
    const user = await prisma.user.create({
      data: {
        name: name || null, // Store name or null if not provided
        email: email.toLowerCase(),
        password: hashedPassword,
        // emailVerified: null, // Prisma adapter might handle this if user signs up with provider first
      },
    });

    // Exclude password from the returned user object
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Usuario registrado exitosamente.", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor al registrar el usuario." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
