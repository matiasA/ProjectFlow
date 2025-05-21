"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import { SendIcon, PaperclipIcon, SettingsIcon } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
}

export default function ChatPage() {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo: Datos simulados
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hola, ¿en qué puedo ayudarte hoy?",
      role: "assistant",
      createdAt: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      id: "2",
      content: "Necesito información sobre modelos de IA generativa",
      role: "user",
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: "3",
      content: "Los modelos de IA generativa como GPT-4, Claude y Llama 2 son sistemas de inteligencia artificial entrenados para generar contenido como texto, imágenes, música o código. Estos modelos aprenden patrones a partir de grandes cantidades de datos y pueden producir salidas nuevas y originales que parecen creadas por humanos.\n\nAlgunos aspectos importantes de los modelos generativos:\n\n1. **Arquitectura**: La mayoría utiliza arquitecturas de transformers con atención para procesar secuencias de tokens.\n\n2. **Entrenamiento**: Son entrenados con millones o billones de parámetros usando grandes conjuntos de datos.\n\n3. **Capacidades**: Pueden generar texto coherente, traducir idiomas, responder preguntas, resumir contenido, y producir texto creativo.\n\n4. **Limitaciones**: Pueden producir información incorrecta (alucinaciones), reproducir sesgos presentes en sus datos de entrenamiento, y tienen conocimiento limitado a su fecha de corte de entrenamiento.\n\n¿Hay algún aspecto específico de los modelos generativos sobre el que te gustaría saber más?",
      role: "assistant",
      createdAt: new Date(Date.now() - 1000 * 60 * 29)
    },
    {
      id: "4",
      content: "¿Cuáles son las diferencias principales entre GPT-4 y Claude?",
      role: "user",
      createdAt: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: "5",
      content: "Las principales diferencias entre GPT-4 (OpenAI) y Claude (Anthropic) son:\n\n**1. Enfoque de entrenamiento:**\n- **GPT-4**: Utiliza entrenamiento predictivo de próximo token y alineación mediante RLHF (Reinforcement Learning from Human Feedback).\n- **Claude**: Desarrollado con Constitutional AI, un enfoque que incluye principios y valores específicos durante el entrenamiento.\n\n**2. Capacidades:**\n- **GPT-4**: Destacado en razonamiento, codificación, y tiene la capacidad de procesar imágenes (GPT-4V).\n- **Claude**: Conocido por seguir instrucciones complejas con precisión, manejar documentos extensos (hasta 100K tokens), y generalmente es considerado más seguro y menos propenso a rechazar consultas legítimas.\n\n**3. Limitaciones de contenido:**\n- **GPT-4**: Tiene más salvaguardas y rechazos para ciertos tipos de contenido sensible.\n- **Claude**: Tiende a ser más abierto en discusiones sobre temas sensibles mientras mantiene salvaguardas éticas.\n\n**4. Personalidad:**\n- **GPT-4**: Neutro y directo en sus respuestas.\n- **Claude**: Diseñado para ser más conversacional, empático y útil.\n\n**5. Ventana contextual:**\n- **GPT-4**: Hasta 128K tokens (aproximadamente 300 páginas) en su versión más avanzada.\n- **Claude 3 Opus**: Hasta 200K tokens (aproximadamente 500 páginas).\n\n¿Te gustaría profundizar en alguna de estas diferencias?",
      role: "assistant",
      createdAt: new Date(Date.now() - 1000 * 60 * 9)
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simular respuesta de IA después de un delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: "Esta es una respuesta simulada. En una implementación real, aquí se conectaría con la API del modelo de lenguaje seleccionado.",
        role: "assistant",
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Chat #{id}</h1>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <SettingsIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.createdAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button 
              type="button" 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <PaperclipIcon className="h-5 w-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300"
              disabled={!inputValue.trim() || isLoading}
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
} 