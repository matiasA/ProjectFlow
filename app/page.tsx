"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import { PlusIcon, MessageSquareIcon, FolderIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react"; // Added ExternalLinkIcon, Loader2Icon
import Link from "next/link";

interface Project { // This is still used for the "Proyectos recientes" section
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { // Made optional as it might not be present in all project fetches
    folders: number;
    chats: number;
  }
}

interface Stats {
  totalProjects: number;
  totalChats: number;
  totalMessages: number;
}

interface RecentChat {
  id: string;
  name: string;
  updatedAt: string;
  project: { name: string } | null; // Project can be null if not associated
  folder: { name: string } | null; // Folder can be null
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for existing projects section
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true); // Renamed isLoading

  // New states for stats and recent chats
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoadingRecentChats, setIsLoadingRecentChats] = useState(true);
  const [errorRecentChats, setErrorRecentChats] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session?.user) {
        // Fetch Projects (existing logic, adapted)
        setIsLoadingProjects(true);
        try {
          const projectsResponse = await fetch('/api/projects');
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData);
          } else {
            console.error("Error al cargar proyectos:", projectsResponse.statusText);
            // Optionally set an error state for projects if needed
          }
        } catch (error) {
          console.error("Error al cargar proyectos:", error);
           // Optionally set an error state for projects
        } finally {
          setIsLoadingProjects(false);
        }

        // Fetch Stats
        setIsLoadingStats(true);
        setErrorStats(null);
        try {
          const statsResponse = await fetch('/api/stats');
          if (!statsResponse.ok) {
            const errorData = await statsResponse.json();
            throw new Error(errorData.error || "Error al cargar estadísticas");
          }
          const statsData = await statsResponse.json();
          setStats(statsData);
        } catch (error: any) {
          console.error("Error al cargar estadísticas:", error);
          setErrorStats(error.message);
        } finally {
          setIsLoadingStats(false);
        }

        // Fetch Recent Chats
        setIsLoadingRecentChats(true);
        setErrorRecentChats(null);
        try {
          const recentChatsResponse = await fetch('/api/chats/recent');
          if (!recentChatsResponse.ok) {
            const errorData = await recentChatsResponse.json();
            throw new Error(errorData.error || "Error al cargar chats recientes");
          }
          const recentChatsData = await recentChatsResponse.json();
          setRecentChats(recentChatsData);
        } catch (error: any) {
          console.error("Error al cargar chats recientes:", error);
          setErrorRecentChats(error.message);
        } finally {
          setIsLoadingRecentChats(false);
        }
      }
    };
    
    if (status === "authenticated") {
      fetchDashboardData();
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
              {isLoadingStats && <Loader2Icon className="h-6 w-6 animate-spin text-blue-500" />}
              {errorStats && <p className="text-xs text-red-500">Error</p>}
              {!isLoadingStats && !errorStats && stats && <p className="text-3xl font-bold">{stats.totalChats}</p>}
              {!isLoadingStats && !stats && !errorStats && <p className="text-3xl font-bold">0</p>}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 flex items-center border border-green-100">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <FolderIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Total de proyectos</h2>
              {isLoadingStats && <Loader2Icon className="h-6 w-6 animate-spin text-green-500" />}
              {errorStats && <p className="text-xs text-red-500">Error</p>}
              {!isLoadingStats && !errorStats && stats && <p className="text-3xl font-bold">{stats.totalProjects}</p>}
              {!isLoadingStats && !stats && !errorStats && <p className="text-3xl font-bold">0</p>}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 flex items-center border border-purple-100">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <MessageSquareIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Mensajes totales</h2>
              {isLoadingStats && <Loader2Icon className="h-6 w-6 animate-spin text-purple-500" />}
              {errorStats && <p className="text-xs text-red-500">Error</p>}
              {!isLoadingStats && !errorStats && stats && <p className="text-3xl font-bold">{stats.totalMessages}</p>}
              {!isLoadingStats && !stats && !errorStats && <p className="text-3xl font-bold">0</p>}
            </div>
          </div>
        </div>

        {/* Proyectos section - uses isLoadingProjects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Proyectos</h2> {/* Changed title slightly */}
            <Link href="/projects/new" className="text-blue-600 hover:text-blue-800 flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>Nuevo proyecto</span>
            </Link>
          </div>

          {isLoadingProjects ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
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

            {isLoadingRecentChats && (
              <div className="flex justify-center py-8">
                <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {errorRecentChats && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2 text-red-700">Error al cargar chats recientes</h3>
                <p className="text-red-500 mb-4">{errorRecentChats}</p>
                {/* Consider adding a retry button here */}
              </div>
            )}
            {!isLoadingRecentChats && !errorRecentChats && recentChats.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No hay chats recientes</h3>
                <p className="text-gray-500 mb-4">Comienza una nueva conversación.</p>
                <Link 
                  href="/new-chat-form" // Updated link to new chat form page
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  <span>Crear chat</span>
                </Link>
              </div>
            )}
            {!isLoadingRecentChats && !errorRecentChats && recentChats.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                {recentChats.map(chat => (
                  <Link key={chat.id} href={`/chat/${chat.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-blue-600 hover:underline flex items-center">
                        {chat.name}
                        <ExternalLinkIcon className="h-3 w-3 ml-1.5 text-gray-400" />
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(chat.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {chat.project?.name ? `Proyecto: ${chat.project.name}` : 'Sin Proyecto Asignado'}
                      {chat.folder?.name && ` · Carpeta: ${chat.folder.name}`}
                    </div>
                    {/* Placeholder for last message snippet if available in future */}
                    {/* <p className="text-gray-500 text-sm truncate mt-1">Última respuesta: ...</p> */}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
