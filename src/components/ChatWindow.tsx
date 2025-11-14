import { useState } from "react";
import { sendChat } from "../services/chatApi";

interface ChatWindowProps {
  onClose: () => void;
}

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const data = await sendChat(input);
    const aiMsg: Message = { sender: "ai", text: data.reply };

    setMessages((prev) => [...prev, aiMsg]);
    setInput("");
  }

  return (
    <div className="fixed bottom-20 right-5 w-80 bg-white shadow-xl rounded-lg p-4 border">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">MediAssist AI</h2>
        <button onClick={onClose} className="text-gray-500">✖</button>
      </div>

      <div className="h-64 overflow-y-auto border p-2 rounded">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={`mb-2 ${
              msg.sender === "user"
                ? "text-right text-blue-600"
                : "text-left text-gray-700"
            }`}
          >
            {msg.text}
          </p>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
