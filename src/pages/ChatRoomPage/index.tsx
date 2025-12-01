import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./index.css";

// ========== 聊天室需要的型別定義 ==========
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
  otherUser: User;  // 對方（賣家或買家）
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatRoomPageProps {
  onBack?: () => void;
  currentUserId?: string;  // 當前登入的使用者ID
  userRole?: "BUYER" | "SELLER";  // 當前使用者角色
}

// ========== 聊天室主組件 ==========
const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  onBack,
  currentUserId = "user_123",
  userRole = "BUYER"
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 載入聊天室列表
  useEffect(() => {
    fetchChatRooms();
  }, []);

  // 選擇聊天室時載入訊息
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.roomId);
    }
  }, [selectedRoom]);

  // 自動滾動到最新訊息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);

      // TODO: 等 Orval 生成 API 後使用
      // import { useChatRooms } from '../api/chat';
      // const { data } = await getChatRooms();
      // setChatRooms(data);

      // 模擬資料
      const mockRooms: ChatRoom[] = userRole === "BUYER"
        ? [
            // 買家看到的是賣家列表
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
            },
            {
              roomId: "room_3",
              otherUser: {
                userId: "seller_c",
                userName: "美食專賣",
                isOnline: true
              },
              lastMessage: {
                messageId: "msg_3",
                senderId: "seller_c",
                senderName: "美食專賣",
                content: "感謝您的購買！",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                isRead: true
              },
              unreadCount: 0
            }
          ]
        : [
            // 賣家看到的是買家列表
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
            },
            {
              roomId: "room_2",
              otherUser: {
                userId: "buyer_b",
                userName: "買家 李小華",
                isOnline: false
              },
              lastMessage: {
                messageId: "msg_2",
                senderId: currentUserId,
                senderName: "我",
                content: "好的，我會盡快處理！",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                isRead: true
              },
              unreadCount: 0
            }
          ];

      setChatRooms(mockRooms);
      if (mockRooms.length > 0) {
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
      // TODO: 等 Orval 生成 API 後使用
      // import { useMessages } from '../api/chat';
      // const { data } = await getMessages(roomId);
      // setMessages(data);

      // 模擬訊息
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
        },
        {
          messageId: "msg_4",
          senderId: selectedRoom?.otherUser.userId || "other",
          senderName: selectedRoom?.otherUser.userName || "對方",
          content: "您好，商品已經出貨囉！",
          timestamp: "2024-01-15T14:30:00",
          isRead: false
        }
      ];

      setMessages(mockMessages);

      // 標記已讀
      markAsRead(roomId);
    } catch (error) {
      console.error("載入訊息失敗:", error);
    }
  };

  const markAsRead = async (roomId: string) => {
    // TODO: 等 Orval 生成 API 後使用
    // import { markMessagesAsRead } from '../api/chat';
    // await markMessagesAsRead(roomId);

    // 更新未讀數
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

    // 立即更新 UI
    setMessages([...messages, newMessage]);

    try {
      // TODO: 等 Orval 生成 API 後使用
      // import { sendMessage } from '../api/chat';
      // await sendMessage({
      //   roomId: selectedRoom.roomId,
      //   content: content.trim()
      // });

      console.log("發送訊息:", content);

      // 更新聊天室列表的最後訊息
      setChatRooms(chatRooms.map(room =>
        room.roomId === selectedRoom.roomId
          ? { ...room, lastMessage: newMessage }
          : room
      ));
    } catch (error) {
      console.error("發送訊息失敗:", error);
      alert("發送失敗，請重試");
      // 移除失敗的訊息
      setMessages(messages);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        onBack={onBack}
        otherUserName={selectedRoom?.otherUser.userName}
        isOnline={selectedRoom?.otherUser.isOnline}
      />

      <div className="chatroom-content">
        {/* 左側：聊天室列表 */}
        <ChatSidebar
          chatRooms={chatRooms}
          selectedRoomId={selectedRoom?.roomId}
          onSelectRoom={handleSelectRoom}
          userRole={userRole}
        />

        {/* 右側：聊天區域 */}
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
              請選擇一個對話
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;