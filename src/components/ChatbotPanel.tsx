import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { sendChat } from "../services/chatApi";

type Props = {
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
};

export default function ChatbotPanel({ chatOpen, setChatOpen }: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [messages, setMessages] = useState<Array<{ id: string; from: "user" | "bot"; text: string }>>([
    { id: "init", from: "bot", text: "Hello! I'm MediAssist. Ask me general health questions." },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (!text) return;
    setError(null);

    const id = Date.now().toString();
    const userMsg = { id, from: "user" as const, text };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setLoading(true);

    try {
      const res = await sendChat(text);
      const botMsg = { id: `${id}-bot`, from: "bot" as const, text: res.reply };
      setMessages((m) => [...m, botMsg]);
    } catch (err: unknown) {
      // Only print errors to console in development; in production consider sending to telemetry
      if (import.meta.env.DEV) console.error("chat send error", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to get a response");
      // show an inline bot error message
      setMessages((m) => [...m, { id: `${id}-err`, from: "bot", text: "Sorry, I couldn't reach the assistant. Try again later." }]);
    } finally {
      setLoading(false);
    }
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
              <div key={m.id} className={m.from === "user" ? "text-right" : "text-left"}>
                <div className={`${m.from === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"} inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
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
