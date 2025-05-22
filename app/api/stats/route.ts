"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    const totalProjects = await prisma.project.count({
      where: { userId: userId },
    });

    const totalChats = await prisma.chat.count({
      where: { userId: userId },
    });
    
    // Count messages based on chats belonging to the user
    // This assumes Message model has a relation to Chat, and Chat has a userId
    const totalMessages = await prisma.message.count({
      where: {
        chat: {
          userId: userId,
        },
        // If Message model also has a direct userId (recommended for easier querying/policy)
        // userId: userId, 
      },
    });

    return NextResponse.json({
      totalProjects,
      totalChats,
      totalMessages,
    });

  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor al obtener estadísticas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
