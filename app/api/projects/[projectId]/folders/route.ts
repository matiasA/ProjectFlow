"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route"; // Adjusted path

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { name } = await req.json();
    const { projectId } = params;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la carpeta es obligatorio" },
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

    const folder = await prisma.folder.create({
      data: {
        name,
        projectId: projectId,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear la carpeta:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la carpeta" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { projectId } = params;

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

    const folders = await prisma.folder.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        updatedAt: 'desc', // Or 'name', 'createdAt' depending on desired order
      },
    });

    return NextResponse.json(folders);
  } catch (error: any) {
    console.error("Error al obtener las carpetas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener las carpetas" },
      { status: 500 }
    );
  }
}
