import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalChat } from "@/hooks/useMedicalChat";
import SeverityScale from "./SeverityScale";
// COMMENTED OUT: Old DeepSeek/generic chat API - replaced with Gemini-powered medical chat
// import { sendChat } from "../services/chatApi";

type Props = {
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
};

export default function ChatbotPanel({ chatOpen, setChatOpen }: Props) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, phase } = useMedicalChat();
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [draft, setDraft] = useState("");
  const [showSeverityScale, setShowSeverityScale] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // scroll to bottom when messages change or when chat opens
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatOpen]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !user) return;

    // Check if the last AI message was a question (contains "scale" or "rate")
    const lastAiMessage = messages[messages.length - 1];
    const isScaleQuestion = lastAiMessage?.role === 'assistant' && 
      (lastAiMessage.content.toLowerCase().includes('scale') || 
       lastAiMessage.content.toLowerCase().includes('rate'));

    if (isScaleQuestion && phase === 'questioning') {
      setPendingMessage(text);
      setShowSeverityScale(true);
      setDraft("");
      return;
    }

    setDraft("");
    await sendMessage(text, user.id, user.name || user.email, user.email);
  }

  function handleSeveritySelect(severity: number) {
    if (!user || !pendingMessage) return;
    
    setShowSeverityScale(false);
    const responseText = `${pendingMessage} (Severity: ${severity}/5)`;
    sendMessage(responseText, user.id, user.name || user.email, user.email, severity);
    setPendingMessage("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  }

  // Desktop layout: right column that expands (does not overlay)
  if (isDesktop) {
    return (
      <div className={`${chatOpen ? "w-80" : "w-0"} transition-all duration-300 flex-shrink-0 h-screen border-l bg-white`} style={{ minWidth: chatOpen ? 320 : 0 }}>
        <div className={`h-full flex flex-col ${chatOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-200`}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">MA</div>
              <div>
                <div className="text-sm font-semibold">MediAssist</div>
                <div className="text-xs text-gray-500">AI assistant</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close" className="p-2 text-gray-600 hover:text-gray-800">
              ✖
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.message_type === 'question' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    📊 Expecting severity rating
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator when waiting for bot */}
            {loading && (
              <div className="text-left">
                <div className="bg-gray-100 text-gray-800 inline-block px-3 py-2 rounded-lg max-w-[40%]">
                  <span className="inline-block animate-pulse">• • •</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <form onSubmit={(e) => { e.preventDefault(); if (!loading) handleSend(); }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Type a message. Enter = send, Shift+Enter = newline"
                className="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">Enter = send • Shift+Enter = newline</div>
                <div className="flex items-center gap-2">
                  {error && <div className="text-xs text-red-500">{error}</div>}
                  <button type="submit" disabled={loading} className={`px-3 py-1 rounded text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Mobile overlay
  return (
    <>
      {chatOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setChatOpen(false)} />}

      <div className={`fixed top-0 right-0 z-50 h-full w-full transform transition-transform duration-300 ${chatOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true">
        <div className="h-full bg-white flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">MA</div>
              <div>
                <div className="text-sm font-semibold">MediAssist</div>
                <div className="text-xs text-gray-500">AI assistant</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close" className="p-2 text-gray-600 hover:text-gray-800">✖</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.from === "user" ? "text-right" : "text-left"}>
                <div className={`${m.from === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"} inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <form onSubmit={(e) => { e.preventDefault(); if (!loading) handleSend(); }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                placeholder="Type a message. Enter = send, Shift+Enter = newline"
                className="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">Enter = send • Shift+Enter = newline</div>
                <div className="flex items-center gap-2">
                  {error && <div className="text-xs text-red-500">{error}</div>}
                  <button type="submit" disabled={loading} className={`px-3 py-1 rounded text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
