import React from "react";
import "./index.css";

interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  messagesEndRef
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-messages">
          開始聊天吧！
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.messageId}
              className={`message-item ${isOwn ? 'own' : 'other'}`}
            >
              <div className="message-bubble">
                {!isOwn && (
                  <div className="message-sender">{message.senderName}</div>
                )}
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;