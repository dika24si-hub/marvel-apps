import React, { useState } from "react";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "cs", text: "Halo! Ada yang bisa kami bantu untuk hewan Anda?" },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "me", text }]);
    setInput("");

    // Balasan dummy otomatis
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "cs",
          text: "Terima kasih atas pesannya. Tim kami akan segera membalas.",
        },
      ]);
    }, 800);
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <strong>Customer Service</strong>
              <span className="chat-status">● Online</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat">
              <FaTimes />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" aria-label="Kirim">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Buka chat"
      >
        {open ? <FaTimes /> : <FaComments />}
      </button>
    </div>
  );
};

export default ChatWidget;