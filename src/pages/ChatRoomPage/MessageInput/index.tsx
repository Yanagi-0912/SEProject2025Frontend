import React, { useState } from "react";
import "./index.css";
import { rewriteMessage } from "../../../api/search";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isSoftening, setIsSoftening] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleSoften = async () => {
    const text = message.trim();
    if (!text) return;

    try {
      setIsSoftening(true);
      const result = await rewriteMessage(text);
      // 只用後端回傳的 polished 內容覆蓋輸入框
      setMessage(result.polished || text);
    } catch (err) {
      console.error("rewriteMessage error", err);
      alert("目前無法潤飾訊息，請稍後再試。");
    } finally {
      setIsSoftening(false);
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
      <div className="message-input-actions">
        <button
          type="button"
          onClick={handleSoften}
          disabled={!message.trim() || isSoftening}
          className="soften-button"
        >
          {isSoftening ? "潤飾中..." : "禮貌修飾"}
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="send-button"
        >
          發送
        </button>
      </div>
    </div>
  );
};

export default MessageInput;