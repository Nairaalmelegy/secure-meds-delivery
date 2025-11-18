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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatOpen]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || !user) return;

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

  if (isDesktop) {
    return (
      <div className={`${chatOpen ? "w-80" : "w-0"} transition-all duration-300 flex-shrink-0 h-screen border-l bg-white`} style={{ minWidth: chatOpen ? 320 : 0 }}>
        <div className={`h-full flex flex-col ${chatOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-200`}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">MA</div>
              <div>
                <div className="text-sm font-semibold">MediAssist</div>
                <div className="text-xs text-muted-foreground">AI Medical Assistant</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close" className="p-2 text-muted-foreground hover:text-foreground">✖</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.message_type === 'question' && (
                  <div className="text-xs text-muted-foreground mt-1">📊 Expecting severity rating</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="bg-muted text-foreground inline-block px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showSeverityScale && (
            <div className="px-4 pb-2">
              <SeverityScale onSelect={handleSeveritySelect} disabled={loading} />
            </div>
          )}

          <div className="p-3 border-t">
            {!user && <div className="text-sm text-muted-foreground text-center mb-2">Please log in to use MediAssist</div>}
            <div className="flex gap-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} placeholder={user ? "Describe your symptoms..." : "Log in to chat"} className="flex-1 border rounded px-3 py-2 text-sm resize-none bg-background text-foreground" rows={2} disabled={loading || !user} />
              <button onClick={handleSend} disabled={loading || !draft.trim() || !user} className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 text-sm font-medium">Send</button>
            </div>
            {phase === 'questioning' && <div className="text-xs text-muted-foreground mt-2 text-center">💬 Gathering information</div>}
            {phase === 'analysis' && <div className="text-xs text-primary mt-2 text-center">✅ Analysis complete</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {chatOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setChatOpen(false)} />}
      <div className={`${chatOpen ? "translate-x-0" : "translate-x-full"} fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">MA</div>
            <div>
              <div className="text-sm font-semibold">MediAssist</div>
              <div className="text-xs text-muted-foreground">AI Medical Assistant</div>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} aria-label="Close" className="p-2 text-muted-foreground hover:text-foreground">✖</button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={`${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap text-left`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.message_type === 'question' && <div className="text-xs text-muted-foreground mt-1">📊 Expecting severity rating</div>}
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="bg-muted text-foreground inline-block px-3 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSeverityScale && (
          <div className="px-4 pb-2">
            <SeverityScale onSelect={handleSeveritySelect} disabled={loading} />
          </div>
        )}

        <div className="p-3 border-t">
          {!user && <div className="text-sm text-muted-foreground text-center mb-2">Please log in to use MediAssist</div>}
          <div className="flex gap-2">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} placeholder={user ? "Describe your symptoms..." : "Log in to chat"} className="flex-1 border rounded px-3 py-2 text-sm resize-none bg-background text-foreground" rows={2} disabled={loading || !user} />
            <button onClick={handleSend} disabled={loading || !draft.trim() || !user} className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 text-sm font-medium">Send</button>
          </div>
          {phase === 'questioning' && <div className="text-xs text-muted-foreground mt-2 text-center">💬 Gathering information</div>}
          {phase === 'analysis' && <div className="text-xs text-primary mt-2 text-center">✅ Analysis complete</div>}
        </div>
      </div>
    </>
  );
}