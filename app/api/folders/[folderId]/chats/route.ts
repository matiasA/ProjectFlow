"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { folderId } = params;

    if (!folderId) {
      return NextResponse.json(
        { error: "El ID de la carpeta es obligatorio" },
        { status: 400 }
      );
    }

    // Verify folder ownership
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { project: true }, // Include project to check ownership
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    if (folder.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para acceder a esta carpeta" },
        { status: 403 }
      );
    }

    // Fetch chats for the folder
    const chats = await prisma.chat.findMany({
      where: {
        folderId: folderId,
        userId: session.user.id, // Ensure chats belong to the user as an extra check
      },
      orderBy: {
        updatedAt: 'desc',
      },
      // Select only metadata, exclude messages by default
      // If messages relation were to be included, explicitly exclude it or use select
    });

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Error al obtener los chats de la carpeta:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener los chats de la carpeta" },
      { status: 500 }
    );
  }
}
