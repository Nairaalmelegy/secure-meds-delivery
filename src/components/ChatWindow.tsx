import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { sendChat } from "../services/chatApi";

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const data = await sendChat(input);
    const aiMsg = { sender: "ai", text: data.reply };

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
          <div
            key={i}
            className={`mb-2 whitespace-pre-wrap ${
              msg.sender === "user"
                ? "text-right text-blue-600"
                : "text-left text-gray-700"
            }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
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
