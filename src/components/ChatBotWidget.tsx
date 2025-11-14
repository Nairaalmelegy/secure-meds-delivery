import { useState } from "react";
import ChatbotPanel from "./ChatbotPanel";

export default function ChatBotWidget() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <ChatbotPanel chatOpen={open} setChatOpen={setOpen} />

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none"
        aria-label="Open chat"
      >
        💬
      </button>
    </>
  );
}
