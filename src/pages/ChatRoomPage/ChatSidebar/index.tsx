import React from "react";
import "./index.css";

interface User {
  userId: string;
  userName: string;
  isOnline: boolean;
}

interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatRoom {
  roomId: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  selectedRoomId?: string;
  onSelectRoom: (room: ChatRoom) => void;
  userRole: "BUYER" | "SELLER";
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatRooms,
  selectedRoomId,
  onSelectRoom,
  userRole
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h3>{userRole === "BUYER" ? "我的賣家" : "我的買家"}</h3>
      </div>
      <div className="chat-room-list">
        {chatRooms.length === 0 ? (
          <div className="empty-chat-list">
            暫無對話
          </div>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.roomId}
              className={`chat-room-item ${selectedRoomId === room.roomId ? 'active' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="chat-room-avatar">
                {room.otherUser.userName.charAt(0)}
                {room.otherUser.isOnline && (
                  <span className="online-indicator"></span>
                )}
              </div>
              <div className="chat-room-info">
                <div className="chat-room-top">
                  <span className="chat-room-name">{room.otherUser.userName}</span>
                  {room.lastMessage && (
                    <span className="chat-room-time">
                      {formatTime(room.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="chat-room-bottom">
                  <span className="chat-room-last-message">
                    {room.lastMessage?.content || "暫無訊息"}
                  </span>
                  {room.unreadCount > 0 && (
                    <span className="chat-room-unread-badge">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;