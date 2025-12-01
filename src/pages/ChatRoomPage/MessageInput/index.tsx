import React, { useState } from "react";
import "./index.css";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="輸入訊息... (Enter發送，Shift+Enter換行)"
        className="message-textarea"
        rows={3}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="send-button"
      >
        發送
      </button>
    </div>
  );
};

export default MessageInput;