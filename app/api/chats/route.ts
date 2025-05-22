"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, LLMProvider } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

const DEFAULT_LLM_PROVIDER: LLMProvider = LLMProvider.OPENAI;
const DEFAULT_MODEL = "gpt-3.5-turbo";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      projectId,
      folderId, // Optional
      llmProvider = DEFAULT_LLM_PROVIDER,
      model = DEFAULT_MODEL,
      temperature = 0.7, // Assuming a default temperature
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del chat es obligatorio" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "El ID del proyecto es obligatorio" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para acceder a este proyecto" },
        { status: 403 }
      );
    }

    // If folderId is provided, verify it belongs to the project
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Carpeta no encontrada" },
          { status: 404 }
        );
      }
      if (folder.projectId !== projectId) {
        return NextResponse.json(
          { error: "La carpeta no pertenece al proyecto especificado" },
          { status: 400 } // Or 403 if preferred
        );
      }
    }

    const chat = await prisma.chat.create({
      data: {
        name,
        userId: session.user.id,
        projectId,
        folderId, // This can be null if not provided
        llmProvider,
        model,
        temperature,
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear el chat:", error);
    if (error.code === 'P2003') { // Foreign key constraint failed
        if (error.meta?.field_name?.includes('projectId')) {
            return NextResponse.json({ error: "Proyecto no encontrado para asociar el chat" }, { status: 404 });
        }
        if (error.meta?.field_name?.includes('folderId')) {
            return NextResponse.json({ error: "Carpeta no encontrada para asociar el chat" }, { status: 404 });
        }
    }
    return NextResponse.json(
      { error: error.message || "Error al crear el chat" },
      { status: 500 }
    );
  }
}
