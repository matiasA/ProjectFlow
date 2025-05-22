"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, LLMProvider } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { chatId } = params;

    if (!chatId) {
      return NextResponse.json(
        { error: "El ID del chat es obligatorio" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        project: true, // To verify ownership
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat no encontrado" },
        { status: 404 }
      );
    }

    // Verify ownership through the project
    if (chat.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para acceder a este chat" },
        { status: 403 }
      );
    }
    
    // Exclude project property from the returned chat object if not needed by client
    // Or select specific fields if preferred for cleaner output
    const { project, ...chatWithoutProject } = chat;

    return NextResponse.json(chatWithoutProject);

  } catch (error: any) {
    console.error("Error al obtener el chat:", error);
    if (error.code === 'P2023' && error.message.includes('Malformed ObjectID')) { // Handle invalid ID format for Prisma MongoDB
      return NextResponse.json({ error: "El ID del chat no es válido" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Error al obtener el chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { chatId } = params;

    if (!chatId) {
      return NextResponse.json(
        { error: "El ID del chat es obligatorio" },
        { status: 400 }
      );
    }

    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { project: true }, // To verify ownership
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat no encontrado" },
        { status: 404 }
      );
    }

    if (existingChat.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este chat" },
        { status: 403 }
      );
    }

    // Perform deletion in a transaction
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { chatId: chatId },
      }),
      prisma.chat.delete({
        where: { id: chatId },
      }),
    ]);

    return NextResponse.json(
      { message: "Chat eliminado correctamente" },
      { status: 200 }
    ); // Or status 204 without a body

  } catch (error: any) {
    console.error("Error al eliminar el chat:", error);
    if (error.code === 'P2023' && error.message.includes('Malformed ObjectID')) {
      return NextResponse.json({ error: "El ID del chat no es válido" }, { status: 400 });
    }
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: "Chat no encontrado para eliminar" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Error al eliminar el chat" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, llmProvider, model, temperature } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: "El ID del chat es obligatorio" },
        { status: 400 }
      );
    }

    // At least one field must be present to update
    if (!name && !llmProvider && !model && temperature === undefined) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un campo para actualizar" },
        { status: 400 }
      );
    }
    
    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === "")) {
      return NextResponse.json(
        { error: "El nombre del chat no puede estar vacío" },
        { status: 400 }
      );
    }

    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { project: true }, // To verify ownership
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat no encontrado" },
        { status: 404 }
      );
    }

    if (existingChat.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar este chat" },
        { status: 403 }
      );
    }

    const dataToUpdate: {
      name?: string;
      llmProvider?: LLMProvider; // Make sure LLMProvider is imported from @prisma/client
      model?: string;
      temperature?: number;
    } = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (llmProvider !== undefined) dataToUpdate.llmProvider = llmProvider;
    if (model !== undefined) dataToUpdate.model = model;
    if (temperature !== undefined) dataToUpdate.temperature = temperature;
    
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: dataToUpdate,
    });

    // Exclude project and messages from the returned chat object
    const { project, messages, ...chatMetadata } = updatedChat;

    return NextResponse.json(chatMetadata);

  } catch (error: any) {
    console.error("Error al actualizar el chat:", error);
    if (error.code === 'P2023' && error.message.includes('Malformed ObjectID')) { // Handle invalid ID format for Prisma MongoDB
      return NextResponse.json({ error: "El ID del chat no es válido" }, { status: 400 });
    }
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: "Chat no encontrado para actualizar" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Error al actualizar el chat" },
      { status: 500 }
    );
  }
}
