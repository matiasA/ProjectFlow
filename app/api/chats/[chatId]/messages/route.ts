"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MessageRole } from "@prisma/client"; // Assuming MessageRole enum exists
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { chatId } = params;
    const body = await req.json();
    const { content, role } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: "El ID del chat es obligatorio" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === "") {
      return NextResponse.json(
        { error: "El contenido del mensaje es obligatorio" },
        { status: 400 }
      );
    }

    if (!role || (role !== MessageRole.USER && role !== MessageRole.ASSISTANT)) {
      return NextResponse.json(
        { error: `El rol del mensaje debe ser '${MessageRole.USER}' o '${MessageRole.ASSISTANT}'` },
        { status: 400 }
      );
    }

    // Verify chat ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { project: true }, // Include project to verify ownership
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat no encontrado" },
        { status: 404 }
      );
    }

    if (chat.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para añadir mensajes a este chat" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        role,
        chatId: chatId,
        userId: session.user.id, // Associate message with the user
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear el mensaje:", error);
    if (error.code === 'P2003' && error.meta?.field_name?.includes('chatId')) { // Foreign key constraint failed on chatId
        return NextResponse.json({ error: "Chat no encontrado para asociar el mensaje" }, { status: 404 });
    }
    // Handle potential errors if MessageRole enum is not correctly used or other Prisma errors
    return NextResponse.json(
      { error: error.message || "Error al crear el mensaje" },
      { status: 500 }
    );
  }
}
