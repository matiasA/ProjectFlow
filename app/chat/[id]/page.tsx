"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import ChatSettings from "../../components/ChatSettings";
import { 
  SendIcon, 
  PaperclipIcon, 
  SettingsIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  Trash2Icon,
  Loader2Icon 
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
}

interface ChatSettings {
  provider: string;
  model: string;
  temperature: number;
}

// Ensure MessageRole is imported if it's used by the API, or adjust as needed
// For now, we assume the API can handle "USER" and "ASSISTANT" strings from "user" and "assistant" roles.
// import { MessageRole } from "@prisma/client"; 

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string; // Assuming id is always a string from params

  const [inputValue, setInputValue] = useState("");
  const [isLoadingLlm, setIsLoadingLlm] = useState(false); // Renamed from isLoading
  const [showSettings, setShowSettings] = useState(false);
  
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    provider: "openai", // Default, will be overwritten by fetched data
    model: "gpt-3.5-turbo", // Default
    temperature: 0.7, // Default
  });
  const [chatName, setChatName] = useState<string>("");
  const [editableChatName, setEditableChatName] = useState<string>("");
  const [isEditingChatName, setIsEditingChatName] = useState<boolean>(false);
  const [isSavingChatName, setIsSavingChatName] = useState<boolean>(false);
  const [chatNameError, setChatNameError] = useState<string | null>(null);

  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [messageSaveError, setMessageSaveError] = useState<string | null>(null);
  
  const [isDeletingChat, setIsDeletingChat] = useState<boolean>(false);
  const [chatDeleteError, setChatDeleteError] = useState<string | null>(null);

  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch chat data and messages on component mount or when ID changes
  useEffect(() => {
    if (!id) return;

    const fetchChatData = async () => {
      setIsLoadingChat(true);
      setChatError(null);
      setMessages([]); // Clear previous messages
      try {
        const response = await fetch(`/api/chats/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setChatError("Chat no encontrado.");
          } else {
            const errorData = await response.json();
            setChatError(errorData.error || "Error al cargar el chat.");
          }
          return;
        }
        const data = await response.json();
        
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          // Ensure createdAt is a Date object. API might return string.
          createdAt: new Date(msg.createdAt), 
        })));
        setChatSettings({
          provider: data.llmProvider, // API returns llmProvider
          model: data.model,
          temperature: data.temperature,
        });
        setChatName(data.name);

      } catch (error: any) {
        console.error("Error fetching chat data:", error);
        setChatError("Ocurrió un error inesperado al cargar el chat.");
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatData();
  }, [id]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSaveError(null); // Clear previous save error
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`, // Temporary local ID
      content: inputValue,
      role: "user",
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoadingLlm(true); // Use renamed state
    
    // Function to save a single message to DB
    const saveMessageToDb = async (messageToSave: Message) => {
      if (!id) return; // Should have id if we are in handleSubmit
      try {
        const apiRole = messageToSave.role === 'user' ? 'USER' : 'ASSISTANT';
        const response = await fetch(`/api/chats/${id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageToSave.content, role: apiRole }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error saving message to DB:', errorData.error || response.statusText);
          setMessageSaveError(`Error al guardar mensaje (${messageToSave.role}). El chat continuará localmente.`);
          // Optionally update message in local state to mark as "not saved"
        }
        // If API returns the saved message with a DB ID, you could update the local message state here.
        // const savedMessage = await response.json();
        // setMessages(prev => prev.map(m => m.id === messageToSave.id ? { ...savedMessage, createdAt: new Date(savedMessage.createdAt) } : m));
      } catch (dbError: any) {
        console.error('Failed to save message to DB:', dbError);
        setMessageSaveError(`Error de red al guardar mensaje (${messageToSave.role}).`);
      }
    };

    // Save user message to DB (fire and forget for now, or await if critical)
    saveMessageToDb(userMessage);

    try {
      const llmApiResponse = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: chatSettings.provider,
          model: chatSettings.model,
          temperature: chatSettings.temperature,
          // Send all messages including the new user message for context
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          })) 
        }),
      });
      
      let assistantMessage: Message;
      if (!llmApiResponse.ok) {
        const errorData = await llmApiResponse.json();
        console.error('LLM API Error:', errorData);
        assistantMessage = {
          id: `error-${Date.now()}`,
          content: errorData.error || "Lo siento, ha ocurrido un error al conectar con el servicio de IA.",
          role: "assistant", // Error shown as assistant message
          createdAt: new Date()
        };
      } else {
        const data = await llmApiResponse.json();
        assistantMessage = {
          id: `assistant-${Date.now()}`, // Temporary local ID
          content: data.choices[0].message.content,
          role: "assistant",
          createdAt: new Date()
        };
      }
      
      setMessages(prev => [...prev, assistantMessage]);
      saveMessageToDb(assistantMessage); // Save assistant message to DB

    } catch (error: any) {
      console.error('LLM request failed:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Lo siento, ha ocurrido un error de red al procesar tu solicitud.",
        role: "assistant",
        createdAt: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      saveMessageToDb(errorMessage); // Save error message (as assistant) to DB
    } finally {
      setIsLoadingLlm(false); // Use renamed state
    }
  };

  const router = useRouter(); // Added for navigation after delete

  const handleSaveSettings = async (newSettings: ChatSettings) => {
    if (!id) return;
    setIsSavingSettings(true);
    setSettingsSaveError(null);
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          llmProvider: newSettings.provider, // Ensure your API expects llmProvider
          model: newSettings.model,
          temperature: newSettings.temperature,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la configuración.");
      }
      setChatSettings(newSettings); // Update local state with new settings
      setShowSettings(false); // Close modal on successful save
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setSettingsSaveError(error.message);
      // Keep modal open to show error
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleStartEditChatName = () => {
    setEditableChatName(chatName);
    setIsEditingChatName(true);
    setChatNameError(null);
  };

  const handleCancelEditChatName = () => {
    setIsEditingChatName(false);
    setChatNameError(null);
  };

  const handleSaveChatName = async () => {
    if (!id || !editableChatName.trim() || editableChatName.trim() === chatName) {
      setIsEditingChatName(false);
      return;
    }
    setIsSavingChatName(true);
    setChatNameError(null);
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editableChatName.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el nombre del chat.");
      }
      const updatedChat = await response.json();
      setChatName(updatedChat.name);
      setIsEditingChatName(false);
    } catch (error: any) {
      console.error("Error saving chat name:", error);
      setChatNameError(error.message);
    } finally {
      setIsSavingChatName(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!id) return;
    if (window.confirm(`¿Estás seguro de que quieres eliminar el chat "${chatName || id}"? Esta acción no se puede deshacer.`)) {
      setIsDeletingChat(true);
      setChatDeleteError(null);
      try {
        const response = await fetch(`/api/chats/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar el chat.");
        }
        router.push('/'); // Navigate to homepage or dashboard on successful delete
      } catch (error: any) {
        console.error("Error deleting chat:", error);
        setChatDeleteError(error.message);
      } finally {
        setIsDeletingChat(false);
      }
    }
  };


  if (isLoadingChat) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <p>Cargando chat...</p>
        </div>
      </AppLayout>
    );
  }

  if (chatError) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-full text-red-500">
          <p>Error: {chatError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            {!isEditingChatName ? (
              <div className="flex items-center">
                <h1 className="text-xl font-semibold truncate pr-2" title={chatName || `Chat ${id}`}>
                  {chatName || `Chat ${id}`}
                </h1>
                <button onClick={handleStartEditChatName} className="p-1 hover:bg-gray-200 rounded-full ml-2" title="Editar nombre">
                  <PencilIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center w-full">
                <input 
                  type="text"
                  value={editableChatName}
                  onChange={(e) => setEditableChatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveChatName()}
                  className="text-xl font-semibold border-b-2 border-blue-500 focus:outline-none flex-grow mr-2"
                  autoFocus
                  disabled={isSavingChatName}
                />
                <button onClick={handleSaveChatName} className="p-1 hover:bg-green-100 rounded-full mr-1" disabled={isSavingChatName} title="Guardar nombre">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </button>
                <button onClick={handleCancelEditChatName} className="p-1 hover:bg-red-100 rounded-full" disabled={isSavingChatName} title="Cancelar edición">
                  <XIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {!isEditingChatName && ( // Hide settings/delete when editing name for simplicity
                <>
                  <span className="text-sm text-gray-500 hidden sm:inline">
                    {chatSettings.provider === 'lmstudio' ? 'LM Studio (Local)' : 
                     (chatSettings.provider?.charAt(0).toUpperCase() + chatSettings.provider?.slice(1))}
                  </span>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Configuración del chat"
                  >
                    <SettingsIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button 
                    onClick={handleDeleteChat}
                    className="p-2 rounded-full hover:bg-red-100"
                    title="Eliminar chat"
                    disabled={isDeletingChat}
                  >
                    {isDeletingChat ? <Loader2Icon className="h-5 w-5 text-red-500 animate-spin" /> : <Trash2Icon className="h-5 w-5 text-red-500" />}
                  </button>
                </>
              )}
            </div>
          </div>
           {chatNameError && <p className="text-xs text-red-500 mt-1">{chatNameError}</p>}
           {chatDeleteError && <p className="text-xs text-red-500 mt-1">{chatDeleteError}</p>}
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
           {messageSaveError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md text-sm">
              <p>{messageSaveError}</p>
            </div>
          )}
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100 text-right' : 'text-gray-500 text-left'
                }`}>
                  {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {/* Add a small indicator for unsaved messages if implementing that feature */}
                  {/* {message.status === 'unsaved' && <span title="No guardado" className="ml-1">⚠️</span>} */}
                </div>
              </div>
            </div>
          ))}
          {isLoadingLlm && ( // Use renamed state
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 max-w-[80%] shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150" style={{ animationDelay: '0.15s' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button 
              type="button" 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              title="Adjuntar archivo (no implementado)"
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              disabled={isLoadingLlm || isLoadingChat} // Disable while loading LLM response or initial chat
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!inputValue.trim() || isLoadingLlm || isLoadingChat} // Disable while loading LLM response or initial chat
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      <ChatSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        chatId={id as string}
        initialProvider={chatSettings.provider}
        onSave={handleSaveSettings}
      />
    </AppLayout>
  );
}