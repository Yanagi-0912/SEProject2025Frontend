import React from "react";
import "./index.css";

interface ChatHeaderProps {
  onBack?: () => void;
  otherUserName?: string;
  isOnline?: boolean;
  onContinueCheckout?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBack,
  otherUserName,
  isOnline,
  onContinueCheckout
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button onClick={onBack} className="chat-header-back-btn">
          <img src="/home-icon.png" alt="返回" className="home-icon-img" />
        </button>
      </div>

      <div className="chat-header-center">
        <h2 className="chat-header-title">
          {otherUserName || " 聊天室"}
        </h2>
        {otherUserName && (
          <span className={`chat-header-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '● 在線' : '● 離線'}
          </span>
        )}
      </div>

      <div className="chat-header-right">
        {onContinueCheckout && (
          <button onClick={onContinueCheckout} className="chat-header-checkout-btn">
            繼續結帳 →
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;