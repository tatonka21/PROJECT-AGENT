// ============================================================
// Ollama LLM Integration — Real AI reasoning
// Supports tool calling via function-calling format
// ============================================================
const OLLAMA_URL = 'http://localhost:11434/api/chat';
export const MODEL = 'qwen2.5:latest'; // Also: llama3.2:1b, deepseek-coder-v2, mistral

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: { role: string; content: string };
  done: boolean;
}

// ============================================================
// Send messages to LLM and get response
// ============================================================
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
        options: { temperature: 0.3, top_p: 0.9 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data: OllamaResponse = await res.json();
    return data.message?.content || '...';
  } catch (e) {
    console.error('Ollama API error:', e);
    return 'TOOL_UNAVAILABLE';
  }
}

// ============================================================
// Stream messages (for real-time responses)
// ============================================================
export async function* streamChatMessage(messages: ChatMessage[]): AsyncGenerator<string> {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: true,
        options: { temperature: 0.3, top_p: 0.9 },
      }),
    });

    if (!res.ok) {
      yield `TOOL_UNAVAILABLE`;
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      yield `TOOL_UNAVAILABLE`;
      return;
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
          if (parsed.done) return;
        } catch { /* skip incomplete lines */ }
      }
    }
  } catch (e) {
    console.error('Ollama stream error:', e);
    yield `TOOL_UNAVAILABLE`;
  }
}