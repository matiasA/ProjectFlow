"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  initialProvider?: string;
  initialModel?: string;
  initialTemperature?: number;
  onSave: (settings: { provider: string; model: string; temperature: number }) => void;
  isSaving?: boolean; // To disable save button during save operation
  saveError?: string | null; // To display save error in modal
}

export default function ChatSettings({
  isOpen,
  onClose,
  chatId,
  initialProvider = "openai", // Default if not provided
  initialModel = "gpt-3.5-turbo", // Default if not provided
  initialTemperature = 0.7, // Default if not provided
  onSave,
  isSaving = false,
  saveError = null,
}: ChatSettingsProps) {
  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState(initialModel);
  const [temperature, setTemperature] = useState(initialTemperature);

  // Update local state if initial props change (e.g., chat loaded after modal is already mounted but hidden)
  useEffect(() => {
    setProvider(initialProvider);
    setModel(initialModel);
    setTemperature(initialTemperature);
  }, [initialProvider, initialModel, initialTemperature, isOpen]); // Re-run if isOpen changes to reset form

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
    // Set default model for the selected provider, ensuring models[newProvider] exists
    const providerModels = models[newProvider as keyof typeof models];
    if (providerModels && providerModels.length > 0) {
      setModel(providerModels[0].id);
    } else {
      setModel(""); // Or some other default/error state
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    onSave({
      provider,
      model,
      temperature,
    });
    // onClose(); // Closing will be handled by parent upon successful save or explicitly
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

          {saveError && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mt-2">
              Error al guardar: {saveError}
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !model} // Disable if no model selected (e.g. provider change led to empty model list)
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}