import React, { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5005/api/chat"; // or 5006 for delivery, adjust as needed

function Chat({ orderId, sender, bubble, formatTime, isPopup = false, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (!orderId) return;
    const fetchMessages = () => {
      fetch(`${API_URL}/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch messages");
          return res.json();
        })
        .then(setMessages)
        .catch(() => setError("Could not load messages"));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Only scroll to bottom if a new message is sent by this user
  useEffect(() => {
    if (
      messages.length > prevMessagesLength.current &&
      messages[messages.length - 1]?.sender === sender
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages, sender]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.trim() || !orderId) {
      setError("Order ID or message is missing.");
      return;
    }
    let backendSender = sender;
    if (sender === "user") backendSender = "customer";
    try {
      const res = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: String(orderId),
          sender: backendSender,
          message: input,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server did not return valid JSON.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to send message");
        if (data.details) console.error("Backend error:", data.details);
        return;
      }
      setMessages((msgs) => [...msgs, data]);
      setInput("");
    } catch {
      setError("Failed to send message (network error)");
    }
  };

  return (
    <>
      {isPopup ? (
        <div
          style={{
            zIndex: 1000,
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <div
            style={{
              maxWidth: 400,
              width: "100%",
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              padding: 0,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: 500,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f59e42", color: "#fff", borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: "12px 16px"}}>
              <span className="font-bold">Order Chat</span>
              <button onClick={onClose} className="text-white text-xl" style={{background: "none", border: "none", fontSize: 24, cursor: "pointer"}}>&times;</button>
            </div>
            {/* ...existing chat UI below... */}
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {error && (
                <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === sender ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === sender ? "#f59e42" : "#eee",
                      color: msg.sender === sender ? "#fff" : "#333",
                      borderRadius: 16,
                      padding: "8px 14px",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                      alignSelf: msg.sender === sender ? "flex-end" : "flex-start",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>
                      {msg.sender === "delivery" ? "You" : msg.sender === "customer" ? "Customer" : msg.sender}
                    </span>
                    <div style={{ fontSize: 15 }}>{msg.message}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                    {formatTime ? formatTime(msg.timestamp || msg.createdAt) : ""}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #eee", padding: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", padding: 8, fontSize: 15 }}
                placeholder="Type a message..."
              />
              <button type="submit" style={{ marginLeft: 8, background: "#f59e42", color: "#fff", border: "none", borderRadius: 6, padding: "0 16px" }}>
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        // ...existing inline chat UI...
        <div style={{ border: "1px solid #ccc", padding: 0, width: 350, background: "#fff", borderRadius: 8, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === sender ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    background: msg.sender === sender ? "#f59e42" : "#eee",
                    color: msg.sender === sender ? "#fff" : "#333",
                    borderRadius: 16,
                    padding: "8px 14px",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    alignSelf: msg.sender === sender ? "flex-end" : "flex-start",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 12 }}>
                    {msg.sender === "delivery" ? "You" : msg.sender === "customer" ? "Customer" : msg.sender}
                  </span>
                  <div style={{ fontSize: 15 }}>{msg.message}</div>
                </div>
                <span style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                  {formatTime ? formatTime(msg.timestamp || msg.createdAt) : ""}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #eee", padding: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", padding: 8, fontSize: 15 }}
              placeholder="Type a message..."
            />
            <button type="submit" style={{ marginLeft: 8, background: "#f59e42", color: "#fff", border: "none", borderRadius: 6, padding: "0 16px" }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chat;
