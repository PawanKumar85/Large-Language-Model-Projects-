import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatResponse = (text) => {
    return text
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\* \*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\* (.*?)\n/g, "• $1<br/>");
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body.getReader();
      let chatbotResponse = "";
      let botMessage = { text: "", sender: "bot" };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chatbotResponse += new TextDecoder().decode(value);
        botMessage.text = chatbotResponse;

        setMessages([...newMessages, { ...botMessage }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { text: "Sorry, I couldn't connect. Please try again later.", sender: "bot" }
      ]);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-lg h-[90vh] bg-white shadow-xl rounded-xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mr-3">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chat with LLM</h2>
            <p className="text-xs text-blue-100">AI Assistant</p>
          </div>
          {isTyping && (
            <div className="ml-auto bg-blue-400 text-white text-xs py-1 px-2 rounded-full animate-pulse">
              💭 Thinking...
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <div className="text-5xl mb-3">👋</div>
              <p className="font-medium">Welcome to Chat Bot!</p>
              <p className="text-sm mt-2">Ask me anything to get started...</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none text-gray-800 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200">
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <input
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="true"
              spellCheck="false"
              autoFocus={true}
              ref={inputRef}
              type="text"
              className="flex-1 p-3 bg-transparent focus:outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`mr-2 p-2 rounded-lg ${
                input.trim() && !isTyping
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "bg-gray-200 text-gray-400"
              } transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}