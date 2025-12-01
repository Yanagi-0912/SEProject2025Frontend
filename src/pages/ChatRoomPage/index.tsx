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

// 引用 CheckoutPage 定義的資料結構
interface CheckoutData {
  orderItems: any[]; // 若需嚴格檢查可複製 SellerGroup[] 定義，或設為 any
  shippingAddress: any; // 若需嚴格檢查可複製 ShippingAddress 定義
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用型別斷言
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
              otherUser: {
                userId: "seller_a",
                userName: "3C數位賣家",
                isOnline: true
              },
              lastMessage: {
                messageId: "msg_1",
                senderId: "seller_a",
                senderName: "3C數位賣家",
                content: "您好，商品已經出貨囉！",
                timestamp: new Date().toISOString(),
                isRead: false
              },
              unreadCount: 2
            },
            {
              roomId: "room_2",
              otherUser: {
                userId: "seller_b",
                userName: "時尚服飾店",
                isOnline: false
              },
              lastMessage: {
                messageId: "msg_2",
                senderId: currentUserId,
                senderName: "我",
                content: "請問還有庫存嗎？",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                isRead: true
              },
              unreadCount: 0
            }
          ]
        : [
            {
              roomId: "room_1",
              otherUser: {
                userId: "buyer_a",
                userName: "買家 王小明",
                isOnline: true
              },
              lastMessage: {
                messageId: "msg_1",
                senderId: "buyer_a",
                senderName: "買家 王小明",
                content: "請問什麼時候會到貨？",
                timestamp: new Date().toISOString(),
                isRead: false
              },
              unreadCount: 1
            }
          ];

      setChatRooms(mockRooms);

      // 如果從結帳頁跳轉過來，自動選擇對應的賣家
      if (targetSellerId) {
        const targetRoom = mockRooms.find(
          room => room.otherUser.userId === targetSellerId
        );
        if (targetRoom) {
          setSelectedRoom(targetRoom);
        } else if (mockRooms.length > 0) {
          setSelectedRoom(mockRooms[0]);
        }
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
    try {
      const mockMessages: Message[] = [
        {
          messageId: "msg_1",
          senderId: selectedRoom?.otherUser.userId || "other",
          senderName: selectedRoom?.otherUser.userName || "對方",
          content: "您好！有什麼可以幫您的嗎？",
          timestamp: "2024-01-15T10:00:00",
          isRead: true
        },
        {
          messageId: "msg_2",
          senderId: currentUserId,
          senderName: "我",
          content: "請問這個商品還有貨嗎？",
          timestamp: "2024-01-15T10:05:00",
          isRead: true
        },
        {
          messageId: "msg_3",
          senderId: selectedRoom?.otherUser.userId || "other",
          senderName: selectedRoom?.otherUser.userName || "對方",
          content: "有的！目前還有庫存",
          timestamp: "2024-01-15T10:06:00",
          isRead: true
        }
      ];

      setMessages(mockMessages);
      markAsRead(roomId);
    } catch (error) {
      console.error("載入訊息失敗:", error);
    }
  };

  const markAsRead = async (roomId: string) => {
    setChatRooms(chatRooms.map(room =>
      room.roomId === roomId ? { ...room, unreadCount: 0 } : room
    ));
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

    try {
      console.log("發送訊息:", content);

      setChatRooms(chatRooms.map(room =>
        room.roomId === selectedRoom.roomId
          ? { ...room, lastMessage: newMessage }
          : room
      ));
    } catch (error) {
      console.error("發送訊息失敗:", error);
      alert("發送失敗，請重試");
      setMessages(messages);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBackHome = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
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

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-text">載入中...</div>
      </div>
    );
  }

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
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                messagesEndRef={messagesEndRef}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
              />
            </>
          ) : (
            <div className="no-chat-selected">
              請從左側選擇一個對話開始聊天
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;