"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();
const RECENT_CHATS_LIMIT = 5;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    const recentChats = await prisma.chat.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
      take: RECENT_CHATS_LIMIT,
      include: {
        project: {
          select: { name: true },
        },
        folder: {
          select: { name: true },
        },
        // If we wanted the last message snippet, it would be more complex.
        // Example (might be inefficient for many chats):
        // _count: { select: { messages: true } }, // Get total messages in chat
        // messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } }
      },
    });

    return NextResponse.json(recentChats);

  } catch (error: any) {
    console.error("Error al obtener chats recientes:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor al obtener chats recientes" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
