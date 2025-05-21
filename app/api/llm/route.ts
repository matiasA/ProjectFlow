"use server";

import { NextRequest, NextResponse } from "next/server";

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, messages, model, temperature = 0.7, max_tokens = 1000 } = body;

    let response;
    
    switch (provider) {
      case 'openai':
        response = await fetchFromOpenAI(messages, model, temperature, max_tokens);
        break;
      case 'anthropic':
        response = await fetchFromAnthropic(messages, model, temperature, max_tokens);
        break;
      case 'mistral':
        response = await fetchFromMistral(messages, model, temperature, max_tokens);
        break;
      case 'lmstudio':
        response = await fetchFromLMStudio(messages, model, temperature, max_tokens);
        break;
      default:
        return NextResponse.json(
          { error: 'Proveedor de LLM no soportado' },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error en la API de LLM:', error);
    return NextResponse.json(
      { error: error.message || 'Error en la API de LLM' },
      { status: 500 }
    );
  }
}

async function fetchFromOpenAI(
  messages: OpenAIMessage[],
  model: string, 
  temperature: number,
  max_tokens: number
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    } as OpenAIRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en la API de OpenAI');
  }

  return response.json();
}

async function fetchFromAnthropic(
  messages: OpenAIMessage[],
  model: string,
  temperature: number,
  max_tokens: number
) {
  // Convertir formato de mensajes de OpenAI a Anthropic
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  
  // Construir la conversación para Anthropic en formato compatible
  const anthropicMessages = userMessages.map(m => ({
    role: m.role,
    content: m.role === 'user' ? m.content : m.content
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': process.env.ANTHROPIC_API_KEY || ''
    },
    body: JSON.stringify({
      model,
      messages: anthropicMessages,
      system: systemMessage,
      temperature,
      max_tokens
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en la API de Anthropic');
  }

  const data = await response.json();
  
  // Adaptar respuesta Anthropic al formato OpenAI
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: data.content[0].text
      }
    }]
  };
}

async function fetchFromMistral(
  messages: OpenAIMessage[],
  model: string,
  temperature: number,
  max_tokens: number
) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    } as OpenAIRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en la API de Mistral');
  }

  return response.json();
}

async function fetchFromLMStudio(
  messages: OpenAIMessage[],
  model: string,
  temperature: number,
  max_tokens: number
) {
  // LMStudio utiliza la API compatible con OpenAI
  const endpoint = process.env.LMSTUDIO_API_ENDPOINT || 'http://localhost:1234/v1';
  
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model, // En LMStudio esto puede ser ignorado ya que usa el modelo cargado
      messages,
      temperature,
      max_tokens
    } as OpenAIRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error en la API de LMStudio');
  }

  return response.json();
} 