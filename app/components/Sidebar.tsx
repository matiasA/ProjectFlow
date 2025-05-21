"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  FolderIcon, 
  PlusIcon, 
  LogOutIcon,
  MessageSquareIcon,
  Settings2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  _count?: {
    folders: number;
    chats: number;
  }
}

interface Folder {
  id: string;
  name: string;
  projectId: string;
}

interface Chat {
  id: string;
  name: string;
  projectId?: string;
  folderId?: string;
}

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estado para los datos
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Cargar proyectos desde la API
  useEffect(() => {
    const fetchProjects = async () => {
      if (session?.user) {
        try {
          setIsLoading(true);
          const response = await fetch('/api/projects');
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
            
            // Expandir el primer proyecto por defecto si existe
            if (data.length > 0) {
              setExpandedProjects(prev => ({
                ...prev,
                [data[0].id]: true
              }));
            }
          }
        } catch (error) {
          console.error("Error al cargar proyectos:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProjects();
  }, [session]);

  // Cargar carpetas y chats al expandir un proyecto
  const loadFoldersAndChats = async (projectId: string) => {
    try {
      // En una implementación real, cargarías las carpetas y chats desde la API
      // Por ahora, usamos datos simulados
      setFolders([
        { id: "1", name: "General", projectId },
        { id: "2", name: "Ideas", projectId }
      ]);
      
      setChats([
        { id: "1", name: "Chat 1", projectId, folderId: "1" },
        { id: "2", name: "Chat 2", projectId, folderId: "1" },
        { id: "3", name: "Chat 3", projectId, folderId: "2" }
      ]);
    } catch (error) {
      console.error("Error al cargar carpetas y chats:", error);
    }
  };

  const toggleProject = (projectId: string) => {
    // Cargar carpetas y chats si el proyecto se está expandiendo
    if (!expandedProjects[projectId]) {
      loadFoldersAndChats(projectId);
    }
    
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const createNewProject = () => {
    router.push("/projects/new");
  };

  const createNewChat = () => {
    router.push("/chat/new");
  };

  if (!session) {
    return null;
  }

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">IA Chat Projects</h1>
        <p className="text-sm text-gray-500">{session.user?.name || session.user?.email}</p>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="mb-4">
          <button 
            onClick={createNewChat}
            className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Nuevo Chat</span>
          </button>
        </div>

        <div className="mb-4">
          <Link href="/" className="flex items-center p-2 rounded-md hover:bg-gray-200">
            <HomeIcon className="w-4 h-4 mr-2" />
            <span>Inicio</span>
          </Link>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Proyectos</h2>
          <button onClick={createNewProject} className="p-1 hover:bg-gray-200 rounded-full">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            <p>No hay proyectos</p>
            <button 
              onClick={createNewProject}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Crear primer proyecto
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="mb-2">
              <div 
                className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                {expandedProjects[project.id] ? 
                  <ChevronDownIcon className="w-4 h-4 mr-1" /> : 
                  <ChevronRightIcon className="w-4 h-4 mr-1" />}
                <FolderIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{project.name}</span>
              </div>
              
              {expandedProjects[project.id] && (
                <div className="pl-6 mt-1">
                  {folders
                    .filter(folder => folder.projectId === project.id)
                    .map(folder => (
                      <div key={folder.id} className="mb-1">
                        <div 
                          className="flex items-center p-1 rounded-md hover:bg-gray-200 cursor-pointer"
                          onClick={() => toggleFolder(folder.id)}
                        >
                          {expandedFolders[folder.id] ? 
                            <ChevronDownIcon className="w-3 h-3 mr-1" /> : 
                            <ChevronRightIcon className="w-3 h-3 mr-1" />}
                          <FolderIcon className="w-3 h-3 mr-2" />
                          <span className="text-xs">{folder.name}</span>
                        </div>

                        {expandedFolders[folder.id] && (
                          <div className="pl-5 mt-1">
                            {chats
                              .filter(chat => chat.folderId === folder.id)
                              .map(chat => (
                                <Link 
                                  href={`/chat/${chat.id}`}
                                  key={chat.id} 
                                  className="flex items-center p-1 rounded-md hover:bg-gray-200"
                                >
                                  <MessageSquareIcon className="w-3 h-3 mr-2" />
                                  <span className="text-xs truncate">{chat.name}</span>
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-gray-200">
        <Link href="/settings" className="flex items-center p-2 rounded-md hover:bg-gray-200">
          <Settings2Icon className="w-4 h-4 mr-2" />
          <span className="text-sm">Configuración</span>
        </Link>
        <button 
          onClick={() => signOut()} 
          className="w-full flex items-center p-2 rounded-md hover:bg-gray-200"
        >
          <LogOutIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
} 