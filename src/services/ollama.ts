const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'llama3.2';

interface ChatMessage {
  role: string;
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data: OllamaResponse = await res.json();
    return data.message?.content || '...';
  } catch (e) {
    console.error('Ollama API error:', e);
    return 'Sorry, I am having trouble connecting. Is Ollama running? Please make sure Ollama is installed and running at http://localhost:11434';
  }
}
