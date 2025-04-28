import React, { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5005/api/chat"; // Update to your backend chat API

function Chat({ orderId, sender }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`${API_URL}/${orderId}`)
      .then((res) => res.json())
      .then(setMessages);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await fetch(`${API_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, sender, message: input }),
    });
    const newMsg = await res.json();
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, width: 350 }}>
      <div style={{ height: 300, overflowY: "auto", marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{ textAlign: msg.sender === sender ? "right" : "left" }}
          >
            <b>{msg.sender}:</b> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
