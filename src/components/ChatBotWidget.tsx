import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function ChatBotWidget() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition"
      >
        💬
      </div>

      {open && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}
