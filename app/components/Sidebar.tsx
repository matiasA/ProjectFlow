"use client";

import { useState } from "react";
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

  // Estado local para demo (en producción cargarías desde la API)
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Proyecto 1" },
    { id: "2", name: "Proyecto 2" }
  ]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "General", projectId: "1" },
    { id: "2", name: "Ideas", projectId: "1" }
  ]);
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", name: "Chat 1", projectId: "1", folderId: "1" },
    { id: "2", name: "Chat 2", projectId: "1", folderId: "1" },
    { id: "3", name: "Chat 3", projectId: "1", folderId: "2" }
  ]);
  
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    "1": true,
    "2": false
  });
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "1": true,
    "2": false
  });

  const toggleProject = (projectId: string) => {
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
    // En producción: llamada a API para crear proyecto
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: "Nuevo Proyecto"
    };
    setProjects([...projects, newProject]);
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
        <p className="text-sm text-gray-500">{session.user?.name}</p>
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

        {projects.map(project => (
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
        ))}
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