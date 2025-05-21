"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppLayout from "./components/AppLayout";
import { PlusIcon, MessageSquareIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center border border-blue-100">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <MessageSquareIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Total de chats</h2>
              <p className="text-3xl font-bold">12</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 flex items-center border border-green-100">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <FolderIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Total de proyectos</h2>
              <p className="text-3xl font-bold">3</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 flex items-center border border-purple-100">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <MessageSquareIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Mensajes totales</h2>
              <p className="text-3xl font-bold">256</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Proyectos recientes</h2>
            <Link href="/projects/new" className="text-blue-600 hover:text-blue-800 flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>Nuevo proyecto</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Proyecto 1</h3>
              <p className="text-gray-500 text-sm mb-4">3 carpetas · 8 chats</p>
              <div className="text-xs text-gray-400">Actualizado hace 2 horas</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Proyecto 2</h3>
              <p className="text-gray-500 text-sm mb-4">1 carpeta · 3 chats</p>
              <div className="text-xs text-gray-400">Actualizado hace 1 día</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Proyecto 3</h3>
              <p className="text-gray-500 text-sm mb-4">2 carpetas · 1 chat</p>
              <div className="text-xs text-gray-400">Actualizado hace 3 días</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chats recientes</h2>
            <Link href="/chat/new" className="text-blue-600 hover:text-blue-800 flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>Nuevo chat</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            <div className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between mb-1">
                <h3 className="font-medium">Investigación sobre IA generativa</h3>
                <span className="text-xs text-gray-500">Hace 30 min</span>
              </div>
              <p className="text-gray-500 text-sm truncate">Última respuesta: Los modelos de IA generativa como GPT-4 funcionan mediante...</p>
              <div className="text-xs text-gray-400 mt-1">Proyecto 1 · Carpeta General</div>
            </div>

            <div className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between mb-1">
                <h3 className="font-medium">Análisis de mercado</h3>
                <span className="text-xs text-gray-500">Hace 2 horas</span>
              </div>
              <p className="text-gray-500 text-sm truncate">Última respuesta: Según los datos proporcionados, el mercado de IA crecerá...</p>
              <div className="text-xs text-gray-400 mt-1">Proyecto 2</div>
            </div>

            <div className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-between mb-1">
                <h3 className="font-medium">Ideas para nuevo producto</h3>
                <span className="text-xs text-gray-500">Ayer</span>
              </div>
              <p className="text-gray-500 text-sm truncate">Última respuesta: Entre las características que podrían diferenciar su producto están...</p>
              <div className="text-xs text-gray-400 mt-1">Proyecto 1 · Carpeta Ideas</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
