"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  initialProvider?: string;
  onSave: (settings: { provider: string; model: string; temperature: number }) => void;
}

export default function ChatSettings({
  isOpen,
  onClose,
  chatId,
  initialProvider = "lmstudio",
  onSave,
}: ChatSettingsProps) {
  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState("local-model");
  const [temperature, setTemperature] = useState(0.7);

  // Modelos disponibles por proveedor
  const models = {
    openai: [
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
      { id: "gpt-4", name: "GPT-4" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    ],
    anthropic: [
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    ],
    mistral: [
      { id: "mistral-tiny", name: "Mistral Tiny" },
      { id: "mistral-small", name: "Mistral Small" },
      { id: "mistral-medium", name: "Mistral Medium" },
    ],
    lmstudio: [
      { id: "local-model", name: "Modelo local" },
    ],
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    // Establecer el modelo predeterminado para el proveedor seleccionado
    setModel(models[newProvider as keyof typeof models][0].id);
  };

  const handleSave = () => {
    onSave({
      provider,
      model,
      temperature,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configuración del Chat</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor de IA
            </label>
            <select
              value={provider}
              onChange={handleProviderChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="mistral">Mistral AI</option>
              <option value="lmstudio">LM Studio (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              {models[provider as keyof typeof models].map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="block w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Más determinista</span>
              <span>Más creativo</span>
            </div>
          </div>

          {provider === 'lmstudio' && (
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
              <p className="font-medium">Usando LM Studio (Local)</p>
              <p className="mt-1">
                Asegúrate de tener LM Studio ejecutándose en tu máquina local con el servidor API
                activado en el puerto predeterminado (1234).
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}