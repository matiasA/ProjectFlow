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
  const [isLoadingProjects, setIsLoadingProjects] = useState(true); // Renamed from isLoading
  
  const [loadingFoldersForProject, setLoadingFoldersForProject] = useState<Record<string, boolean>>({});
  const [loadingChatsForFolder, setLoadingChatsForFolder] = useState<Record<string, boolean>>({});
  const [errorFolders, setErrorFolders] = useState<string | null>(null);
  const [errorChats, setErrorChats] = useState<string | null>(null);

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Cargar proyectos desde la API
  useEffect(() => {
    const fetchProjects = async () => {
      if (session?.user) {
        try {
          setIsLoadingProjects(true); // Use renamed state
          const response = await fetch('/api/projects');
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
            
            // Expandir el primer proyecto por defecto si existe
            if (data.length > 0 && data[0].id) { // ensure data[0].id exists
              setExpandedProjects(prev => ({
                ...prev,
                [data[0].id]: true
              }));
              // Automatically load folders for the first expanded project
              // This will be handled by toggleProject or a direct call if needed
            }
          }
        } catch (error) {
          console.error("Error al cargar proyectos:", error);
        } finally {
          setIsLoadingProjects(false); // Use renamed state
        }
      }
    };
    
    fetchProjects();
  }, [session]);

  // Cargar carpetas para un proyecto específico
  const loadFolders = async (projectId: string) => {
    if (folders.some(folder => folder.projectId === projectId) && !errorFolders) { // Basic check to avoid re-fetching if already loaded and no error
      // Folders for this project might already be loaded.
      // Potentially add a more robust check or a forced refresh mechanism if needed.
      return;
    }
    
    setLoadingFoldersForProject(prev => ({ ...prev, [projectId]: true }));
    setErrorFolders(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/folders`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al cargar carpetas: ${response.status}`);
      }
      const data: Folder[] = await response.json();
      setFolders(prevFolders => [
        ...prevFolders.filter(f => f.projectId !== projectId), // Remove existing folders for this project before adding new ones
        ...data
      ]);
    } catch (error: any) {
      console.error("Error al cargar carpetas:", error);
      setErrorFolders(error.message);
    } finally {
      setLoadingFoldersForProject(prev => ({ ...prev, [projectId]: false }));
    }
  };
  
  // Cargar chats para una carpeta específica
  const loadChats = async (folderId: string) => {
    if (chats.some(chat => chat.folderId === folderId) && !errorChats) { // Basic check
      return;
    }

    setLoadingChatsForFolder(prev => ({ ...prev, [folderId]: true }));
    setErrorChats(null);
    try {
      const response = await fetch(`/api/folders/${folderId}/chats`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al cargar chats: ${response.status}`);
      }
      const data: Chat[] = await response.json();
      setChats(prevChats => [
        ...prevChats.filter(c => c.folderId !== folderId), // Remove existing chats for this folder
        ...data.map(chat => ({ ...chat, folderId })) // Ensure folderId is set
      ]);
    } catch (error: any) {
      console.error("Error al cargar chats:", error);
      setErrorChats(error.message);
    } finally {
      setLoadingChatsForFolder(prev => ({ ...prev, [folderId]: false }));
    }
  };

  const toggleProject = (projectId: string) => {
    const isCurrentlyExpanded = !!expandedProjects[projectId];
    if (!isCurrentlyExpanded) {
      // Load folders only if they haven't been loaded for this project yet, or if there was a previous error
      if (!folders.some(f => f.projectId === projectId) || errorFolders) {
        loadFolders(projectId);
      }
    }
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !isCurrentlyExpanded
    }));
  };

  const toggleFolder = (folderId: string) => {
    const isCurrentlyExpanded = !!expandedFolders[folderId];
    if (!isCurrentlyExpanded) {
      // Load chats only if they haven't been loaded for this folder yet, or if there was a previous error
      if (!chats.some(c => c.folderId === folderId) || errorChats) {
        loadChats(folderId);
      }
    }
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !isCurrentlyExpanded
    }));
  };

  const createNewProject = () => {
    router.push("/projects/new");
  };

  const createNewChat = () => {
    router.push("/new-chat-form"); // Updated route
  };

  const handleCreateNewFolder = (projectId: string) => {
    // Placeholder for now. In a real scenario, this would open a modal or navigate to a form.
    console.log(`Solicitud para crear nueva carpeta en proyecto: ${projectId}`);
    // Example: prompt for folder name
    const folderName = prompt("Ingrese el nombre de la nueva carpeta:");
    if (folderName && folderName.trim() !== "") {
      // Here you would call the API to create the folder
      console.log(`Creando carpeta "${folderName}" en proyecto ${projectId}`);
      // After creation, you might want to refresh the folder list for this project:
      // loadFolders(projectId); 
    }
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
          <button onClick={createNewProject} className="p-1 hover:bg-gray-200 rounded-full" title="Crear nuevo proyecto">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {isLoadingProjects ? ( // Use renamed state
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
                <div className="pl-4 mt-1 space-y-1">
                  <button
                    onClick={() => handleCreateNewFolder(project.id)}
                    className="flex items-center w-full text-xs p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
                  >
                    <PlusIcon className="w-3 h-3 mr-2" />
                    Nueva Carpeta
                  </button>
                  {loadingFoldersForProject[project.id] && <p className="text-xs text-gray-500 pl-2">Cargando carpetas...</p>}
                  {errorFolders && <p className="text-xs text-red-500 pl-2">Error al cargar carpetas.</p>}
                  {!loadingFoldersForProject[project.id] && !errorFolders && folders.filter(folder => folder.projectId === project.id).length === 0 && (
                    <p className="text-xs text-gray-400 pl-2 pt-1">No hay carpetas en este proyecto.</p>
                  )}
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
                            {loadingChatsForFolder[folder.id] && <p className="text-xs text-gray-500">Cargando chats...</p>}
                            {errorChats && <p className="text-xs text-red-500">Error al cargar chats.</p>}
                            {!loadingChatsForFolder[folder.id] && !errorChats && chats.filter(chat => chat.folderId === folder.id).length === 0 && (
                               <p className="text-xs text-gray-400 pt-1">No hay chats en esta carpeta.</p>
                            )}
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