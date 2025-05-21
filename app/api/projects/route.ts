"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { name, description } = await req.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del proyecto es obligatorio" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    // Crear una carpeta por defecto para el proyecto
    await prisma.folder.create({
      data: {
        name: "General",
        projectId: project.id,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error al crear el proyecto:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear el proyecto" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        _count: {
          select: {
            folders: true,
            chats: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Error al obtener los proyectos:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener los proyectos" },
      { status: 500 }
    );
  }
} 