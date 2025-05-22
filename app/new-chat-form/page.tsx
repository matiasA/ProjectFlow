"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/app/components/AppLayout"; // Assuming this path is correct

interface Project {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  projectId: string; // Keep projectId to ensure correct filtering if needed, though API should handle it
}

interface ChatResponse { // For the POST /api/chats response
  id: string;
  // other chat properties...
}

export default function NewChatFormPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>(""); // Store folder ID
  const [chatName, setChatName] = useState<string>("");

  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState<boolean>(false);
  
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorFolders, setErrorFolders] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      setErrorProjects(null);
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al cargar proyectos");
        }
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (error: any) {
        setErrorProjects(error.message);
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch folders when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) {
      setFolders([]);
      setSelectedFolderId(""); // Reset folder selection
      return;
    }

    const fetchFolders = async () => {
      setIsLoadingFolders(true);
      setErrorFolders(null);
      setFolders([]); // Clear previous folders
      try {
        const response = await fetch(`/api/projects/${selectedProjectId}/folders`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al cargar carpetas");
        }
        const data: Folder[] = await response.json();
        setFolders(data);
      } catch (error: any) {
        setErrorFolders(error.message);
        console.error("Error fetching folders:", error);
      } finally {
        setIsLoadingFolders(false);
      }
    };
    fetchFolders();
  }, [selectedProjectId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!chatName.trim()) {
      setSubmitError("El nombre del chat es obligatorio.");
      return;
    }
    if (!selectedProjectId) {
      setSubmitError("Debe seleccionar un proyecto.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: { name: string; projectId: string; folderId?: string } = {
        name: chatName,
        projectId: selectedProjectId,
      };
      if (selectedFolderId) {
        payload.folderId = selectedFolderId;
      }

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el chat");
      }

      const newChat: ChatResponse = await response.json();
      router.push(`/chat/${newChat.id}`);

    } catch (error: any) {
      setSubmitError(error.message);
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Chat</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="chatName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Chat
            </label>
            <input
              type="text"
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto
            </label>
            {isLoadingProjects && <p className="text-sm text-gray-500">Cargando proyectos...</p>}
            {errorProjects && <p className="text-sm text-red-500">Error: {errorProjects}</p>}
            {!isLoadingProjects && !errorProjects && projects.length === 0 && (
              <p className="text-sm text-gray-500">No hay proyectos disponibles. Por favor, cree un proyecto primero.</p>
            )}
            {!isLoadingProjects && projects.length > 0 && (
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedFolderId(""); // Reset folder when project changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting || isLoadingProjects}
              >
                <option value="" disabled>Seleccione un proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
              Carpeta (Opcional)
            </label>
            {selectedProjectId && isLoadingFolders && <p className="text-sm text-gray-500">Cargando carpetas...</p>}
            {selectedProjectId && errorFolders && <p className="text-sm text-red-500">Error: {errorFolders}</p>}
            {selectedProjectId && !isLoadingFolders && !errorFolders && folders.length === 0 && (
              <p className="text-sm text-gray-500">No hay carpetas en este proyecto. Puede crear el chat sin carpeta.</p>
            )}
            <select
              id="folder"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedProjectId || isLoadingFolders || isSubmitting || folders.length === 0}
            >
              <option value="">Sin carpeta (opcional)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          
          {submitError && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{submitError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting || isLoadingProjects || (!selectedProjectId && projects.length > 0)}
          >
            {isSubmitting ? "Creando Chat..." : "Crear Chat"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
