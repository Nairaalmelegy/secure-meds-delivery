export interface ChatResponse {
  reply: string;
}

export async function sendChat(message: string): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat response");
  }

  return response.json() as Promise<ChatResponse>;
}
