import React from "react";
import "./index.css";

interface ChatHeaderProps {
  onBack?: () => void;
  otherUserName?: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, otherUserName, isOnline }) => {
  return (
    <div className="chat-header">
      <button onClick={onBack} className="chat-header-back-btn">
        ← 返回
      </button>
      <div className="chat-header-info">
        <h2 className="chat-header-title">
          {otherUserName || "聊天室"}
        </h2>
        {otherUserName && (
          <span className={`chat-header-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '● 在線' : '● 離線'}
          </span>
        )}
      </div>
      <div className="chat-header-spacer"></div>
    </div>
  );
};

export default ChatHeader;