const API_BASE_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  grant_id: number;
  user_message: string;
  wallet_address: string;
  conversation_history?: Message[];
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
}

export const agentApi = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to get response from agent");
    }

    return response.json();
  },
};
