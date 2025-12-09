import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
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

interface CheckoutData {
  orderItems: any[];
  shippingAddress: any;
}

interface ChatLocationState {
  returnToCheckout?: boolean;
  checkoutData?: CheckoutData;
  sellerId?: string;
  sellerName?: string;
}

interface ChatRoomPageProps {
  onBack?: () => void;
  currentUserId?: string;
  userRole?: "BUYER" | "SELLER";
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  onBack,
  currentUserId = "user_123",
  userRole = "BUYER"
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // 1. 定義 Ref 時注意型別
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const state = location.state as ChatLocationState | null;
  const returnToCheckout = state?.returnToCheckout || false;
  const checkoutData = state?.checkoutData;
  const targetSellerId = state?.sellerId;

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.roomId);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const mockRooms: ChatRoom[] = userRole === "BUYER"
        ? [
            {
              roomId: "room_1",
              otherUser: { userId: "seller_a", userName: "3C數位賣家", isOnline: true },
              lastMessage: {
                messageId: "msg_1", senderId: "seller_a", senderName: "3C數位賣家",
                content: "您好，商品已經出貨囉！", timestamp: new Date().toISOString(), isRead: false
              },
              unreadCount: 2
            }
          ]
        : [];

      setChatRooms(mockRooms);
      if (targetSellerId) {
        const targetRoom = mockRooms.find(room => room.otherUser.userId === targetSellerId);
        if (targetRoom) setSelectedRoom(targetRoom);
        else if (mockRooms.length > 0) setSelectedRoom(mockRooms[0]);
      } else if (mockRooms.length > 0) {
        setSelectedRoom(mockRooms[0]);
      }
    } catch (error) {
      console.error("載入聊天室失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setMessages([
        {
          messageId: "msg_1",
          senderId: selectedRoom?.otherUser.userId || "other",
          senderName: selectedRoom?.otherUser.userName || "對方",
          content: "您好！有什麼可以幫您的嗎？",
          timestamp: "2024-01-15T10:00:00",
          isRead: true
        }
    ]);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedRoom || !content.trim()) return;
    const newMessage: Message = {
      messageId: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: "我",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages([...messages, newMessage]);
  };

  const handleSelectRoom = (room: ChatRoom) => setSelectedRoom(room);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBackHome = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  const handleContinueCheckout = () => {
    if (checkoutData) {
      navigate('/checkout', {
        state: {
          orderItems: checkoutData.orderItems,
          shippingAddress: checkoutData.shippingAddress
        }
      });
    }
  };

  if (loading) return <div className="chat-loading">載入中...</div>;

  return (
    <div className="chatroom-container">
      <ChatHeader
        onBack={handleBackHome}
        otherUserName={selectedRoom?.otherUser.userName}
        isOnline={selectedRoom?.otherUser.isOnline}
        onContinueCheckout={returnToCheckout ? handleContinueCheckout : undefined}
      />

      <div className="chatroom-content">
        <ChatSidebar
          chatRooms={chatRooms}
          selectedRoomId={selectedRoom?.roomId}
          onSelectRoom={handleSelectRoom}
          userRole={userRole}
        />

        <div className="chat-main">
          {selectedRoom ? (
            <>
              {/* 2. 使用 as React.RefObject<HTMLDivElement> 來安全傳遞 ref */}
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
              />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="no-chat-selected">請從左側選擇一個對話開始聊天</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;