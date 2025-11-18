// ==========================================
// COMMENTED OUT: Old generic chat API
// This file has been replaced by Gemini-powered medical chat
// See: supabase/functions/medical-chat/index.ts
// New implementation uses:
// - Google Gemini AI for medical reasoning
// - Patient medical records integration
// - Interactive questioning system with severity scales
// - Database storage for doctor review
// ==========================================

export interface ChatResponse {
  reply: string;
}

// Legacy function - no longer used
// Replaced by: src/hooks/useMedicalChat.ts
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
