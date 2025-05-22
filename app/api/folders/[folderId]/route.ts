"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

export async function DELETE(
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

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { project: true }, // Include the project to check ownership
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    if (folder.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta carpeta" },
        { status: 403 }
      );
    }

    // Delete associated chats first (transaction for atomicity)
    await prisma.$transaction([
      prisma.chat.deleteMany({
        where: { folderId: folderId },
      }),
      prisma.folder.delete({
        where: { id: folderId },
      }),
    ]);

    return NextResponse.json(
      { message: "Carpeta eliminada correctamente" },
      { status: 200 }
    ); // Or 204 No Content, but 200 with message is also fine
  } catch (error: any) {
    console.error("Error al eliminar la carpeta:", error);
    // Check for specific Prisma errors if needed, e.g., P2025 (Record not found)
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "Carpeta no encontrada o ya eliminada" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Error al eliminar la carpeta" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { folderId } = params;
    const { name } = await req.json();

    if (!folderId) {
      return NextResponse.json(
        { error: "El ID de la carpeta es obligatorio" },
        { status: 400 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la carpeta es obligatorio" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { project: true }, // Include the project to check ownership
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    if (folder.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta carpeta" },
        { status: 403 }
      );
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });

    return NextResponse.json(updatedFolder);
  } catch (error: any) {
    console.error("Error al actualizar la carpeta:", error);
    if (error.code === 'P2025') { // Prisma specific error for record not found during update
        return NextResponse.json({ error: "Carpeta no encontrada" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Error al actualizar la carpeta" },
      { status: 500 }
    );
  }
}
