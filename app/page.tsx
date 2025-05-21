"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import { PlusIcon, MessageSquareIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    folders: number;
    chats: number;
  }
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (session?.user) {
        try {
          setIsLoading(true);
          const response = await fetch('/api/projects');
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
          }
        } catch (error) {
          console.error("Error al cargar proyectos:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [session, status]);

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
  
  // Formatear la fecha a una cadena legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "hace menos de un minuto";
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString();
  };

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
              <p className="text-3xl font-bold">{projects.length}</p>
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

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No hay proyectos todavía</h3>
              <p className="text-gray-500 mb-4">Comienza creando tu primer proyecto</p>
              <Link 
                href="/projects/new" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                <span>Crear proyecto</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {project._count.folders} {project._count.folders === 1 ? 'carpeta' : 'carpetas'} · 
                    {' '}{project._count.chats} {project._count.chats === 1 ? 'chat' : 'chats'}
                  </p>
                  <div className="text-xs text-gray-400">Actualizado {formatDate(project.updatedAt)}</div>
                </div>
              ))}
            </div>
          )}
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
