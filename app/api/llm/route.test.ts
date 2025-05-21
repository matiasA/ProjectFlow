// app/api/llm/route.test.ts
import { POST } from './route';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextResponse.json
// This is necessary because the actual NextResponse.json might have
// dependencies or behaviors not suitable for a Jest/JSDOM environment.
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn((body, init) => {
        // Return a simplified object that mimics a Response for testing purposes
        return {
          status: init?.status || 200,
          json: async () => body, // The POST handler awaits response.json()
          headers: new Headers(init?.headers),
          // Add other properties if your tests need them (e.g., ok, statusText)
          ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
          statusText: 'OK', // Or derive from status
        };
      }),
    },
  };
});

// Helper to create a MOCKED NextRequest
// This avoids issues with NextRequest constructor in Jest/JSDOM environment
const createMockRequest = (body: any): NextRequest => {
  const requestBody = JSON.stringify(body);
  const headers = new Headers({ 'Content-Type': 'application/json' });

  // Mock the methods and properties of NextRequest that are used by the POST handler
  return {
    json: async () => JSON.parse(requestBody),
    headers: headers,
    // Add any other properties/methods of NextRequest that your POST handler might use
    // For example, if it uses req.url, req.method, etc.
    url: 'http://localhost/api/llm',
    method: 'POST',
    // Cast to NextRequest to satisfy the type checker
  } as NextRequest;
};

// Store original process.env
const originalEnv = { ...process.env };

describe('LLM API Route', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Restore process.env to a copy of the original state before each test
    // This is important because process.env can be modified by tests
    process.env = { ...originalEnv };
    // Spy on global.fetch
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    // Restore the original fetch implementation
    fetchSpy.mockRestore();
    // Restore original process.env
    process.env = { ...originalEnv };
    // Clear all other Jest mocks (e.g., if we were to mock other modules)
    jest.clearAllMocks();
  });

  // Mock environment variables helper
  const mockEnv = (envVars: Record<string, string | undefined>) => {
    // Iterate over the provided envVars and set them on process.env
    // If a value is undefined, delete the key from process.env to simulate it not being set
    for (const key in envVars) {
      if (envVars[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envVars[key];
      }
    }
  };

  describe('OpenAI Provider', () => {
    it('should return a successful response for a valid OpenAI request', async () => {
      mockEnv({ OPENAI_API_KEY: 'test-openai-key' });

      const mockOpenAIResponse = {
        id: 'chatcmpl-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello from OpenAI!' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockOpenAIResponse), { status: 200 })
      );

      const requestBody = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.choices[0].message.content).toBe('Hello from OpenAI!');
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-openai-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7, // Default value from route.ts
            max_tokens: 1000, // Default value from route.ts
          }),
        })
      );
    });

    it('should return a 400 error if OPENAI_API_KEY is not set', async () => {
      mockEnv({ OPENAI_API_KEY: undefined }); // Ensure key is not set

      const requestBody = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Clave de API de OpenAI no configurada en variables de entorno');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 500 error if OpenAI API call fails', async () => {
      mockEnv({ OPENAI_API_KEY: 'test-openai-key' });

      const mockErrorBody = { error: 'OpenAI API Error' };
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockErrorBody), { status: 500 })
      );

      const requestBody = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Error en la API de OpenAI');
      expect(responseJson.details).toBe('Error en la API de OpenAI');
    });
  });

  describe('Anthropic Provider', () => {
    it('should return a successful response for a valid Anthropic request', async () => {
      mockEnv({ ANTHROPIC_API_KEY: 'test-anthropic-key' });

      const mockAnthropicResponse = {
        id: 'msg-test',
        type: 'message',
        role: 'assistant',
        model: 'claude-2',
        content: [{ type: 'text', text: 'Hello from Anthropic!' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockAnthropicResponse), { status: 200 })
      );

      const requestBody = {
        provider: 'anthropic',
        model: 'claude-2',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1024,
      };
      const req = createMockRequest(requestBody);
      const responseFromPost = await POST(req);
      const responseJson = await responseFromPost.json(); // Correctly access the body from the mocked NextResponse


      expect(responseFromPost.status).toBe(200);
      expect(responseJson.choices[0].message.role).toBe('assistant');
      expect(responseJson.choices[0].message.content).toBe('Hello from Anthropic!');
      expect(responseJson.usage).toBeDefined();
      expect(responseJson.usage.prompt_tokens).toBe(10);
      expect(responseJson.usage.completion_tokens).toBe(5);
      expect(responseJson.usage.total_tokens).toBe(15);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-anthropic-key',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            model: 'claude-2',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 1024,
            system: undefined,
            temperature: 0.7,
          }),
        })
      );
    });

    it('should return a 400 error if ANTHROPIC_API_KEY is not set', async () => {
      mockEnv({ ANTHROPIC_API_KEY: undefined });

      const requestBody = {
        provider: 'anthropic',
        model: 'claude-2',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1024,
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Clave de API de Anthropic no configurada en variables de entorno');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 500 error if Anthropic API call fails', async () => {
      mockEnv({ ANTHROPIC_API_KEY: 'test-anthropic-key' });

      const anthropicError = { type: 'error', error: { type: 'api_error', message: 'Anthropic API Error' } };
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(anthropicError), { status: 500 })
      );

      const requestBody = {
        provider: 'anthropic',
        model: 'claude-2',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1024,
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Anthropic API Error');
      expect(responseJson.details).toBe('Anthropic API Error');
    });
  });

  describe('Mistral Provider', () => {
    it('should return a successful response for a valid Mistral request', async () => {
      mockEnv({ MISTRAL_API_KEY: 'test-mistral-key' });

      const mockMistralResponse = {
        id: 'cmpl-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'mistral-tiny',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello from Mistral!' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockMistralResponse), { status: 200 })
      );

      const requestBody = {
        provider: 'mistral',
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.choices[0].message.content).toBe('Hello from Mistral!');
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.mistral.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-mistral-key',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            model: 'mistral-tiny',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })
      );
    });

    it('should return a 400 error if MISTRAL_API_KEY is not set', async () => {
      mockEnv({ MISTRAL_API_KEY: undefined });

      const requestBody = {
        provider: 'mistral',
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Clave de API de Mistral no configurada en variables de entorno');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 500 error if Mistral API call fails', async () => {
      mockEnv({ MISTRAL_API_KEY: 'test-mistral-key' });

      const mistralError = { message: 'Mistral API Error' };
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mistralError), { status: 500 })
      );

      const requestBody = {
        provider: 'mistral',
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Error en la API de Mistral');
      expect(responseJson.details).toBe('Error en la API de Mistral');
    });
  });

  describe('LMStudio Provider', () => {
    beforeEach(() => {
      delete process.env.LMSTUDIO_API_URL;
    });

    it('should return a successful response for a valid LMStudio request (default URL)', async () => {
      mockEnv({ LMSTUDIO_API_URL: undefined });

      const mockLMStudioResponse = {
        id: 'chatcmpl-lmstudio-default',
        object: 'chat.completion',
        created: Date.now(),
        model: 'local-model',
        choices: [{ index: 0, message: { role: 'assistant', content: 'Hello from LMStudio (default)!' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockLMStudioResponse), { status: 200 })
      );

      const requestBody = {
        provider: 'lmstudio',
        model: 'local-model',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.choices[0].message.content).toBe('Hello from LMStudio (default)!');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            model: 'local-model',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })
      );
    });

    it('should return a successful response for a valid LMStudio request (custom URL)', async () => {
      mockEnv({ LMSTUDIO_API_URL: 'http://custom-lmstudio-url:8080/v1' });

      const mockLMStudioResponse = {
        id: 'chatcmpl-lmstudio-custom',
        object: 'chat.completion',
        created: Date.now(),
        model: 'custom-model',
        choices: [{ index: 0, message: { role: 'assistant', content: 'Hello from LMStudio (custom)!' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 12, completion_tokens: 6, total_tokens: 18 },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockLMStudioResponse), { status: 200 })
      );

      const requestBody = {
        provider: 'lmstudio',
        model: 'custom-model',
        messages: [{ role: 'user', content: 'Hi there' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.choices[0].message.content).toBe('Hello from LMStudio (custom)!');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://custom-lmstudio-url:8080/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            model: 'custom-model',
            messages: [{ role: 'user', content: 'Hi there' }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })
      );
    });

    it('should return a 500 error if LMStudio API call fails', async () => {
      mockEnv({ LMSTUDIO_API_URL: 'http://custom-lmstudio-url/v1' });

      const lmstudioError = { error: 'LMStudio API Error' };
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(lmstudioError), { status: 500 })
      );

      const requestBody = {
        provider: 'lmstudio',
        model: 'local-model',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Error al conectar con LMStudio: LMStudio API Error');
      expect(responseJson.details).toBe('LMStudio API Error');
    });
  });

  describe('General Error Handling', () => {
    it('should return a 400 error for an unsupported LLM provider', async () => {
      const requestBody = {
        provider: 'unknown-provider',
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Proveedor de LLM no soportado');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 400 error if provider is missing in the request body', async () => {
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Proveedor de LLM no soportado');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 400 error if model is missing in the request body', async () => {
      mockEnv({ OPENAI_API_KEY: 'test-key-to-pass-api-key-check' });
      const requestBody = {
        provider: 'openai',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req); // This will be the mocked NextResponse
      const responseJson = await response.json(); // This will be the body part of mocked NextResponse

      // The current route.ts validation for missing model/messages is hit first.
      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Falta el proveedor, modelo o mensajes en el cuerpo de la solicitud.');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 400 error if messages are missing in the request body', async () => {
      mockEnv({ OPENAI_API_KEY: 'test-key-to-pass-api-key-check' });
      const requestBody = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req); // This will be the mocked NextResponse
      const responseJson = await response.json(); // This will be the body part of mocked NextResponse

      // The current route.ts validation for missing model/messages is hit first.
      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Falta el proveedor, modelo o mensajes en el cuerpo de la solicitud.');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return a 500 error for a general network failure during fetch', async () => {
      mockEnv({ OPENAI_API_KEY: 'test-key' });

      const networkError = new Error('Simulated network error');
      fetchSpy.mockRejectedValueOnce(networkError);

      const requestBody = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const req = createMockRequest(requestBody);
      const response = await POST(req);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Error al procesar la solicitud de LLM');
      expect(responseJson.details).toBe('Simulated network error');
    });
  });
});
