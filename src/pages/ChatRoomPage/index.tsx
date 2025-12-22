import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./index.css";
import { useGetCurrentUser } from "../../api/generated";

// ============================================================================
// Vercel 部署設定 (關鍵修改區域)
// ============================================================================

// 定義後端 API 基礎網址 (不含 http/https, 不含 ws/wss)
// 開發時: localhost:8080
// 部署時: 你的後端網址 (例如: my-backend.onrender.com)
// 建議: 將 "localhost:8080" 替換成 process.env.REACT_APP_API_DOMAIN 或直接寫你的 Render 網址
const BACKEND_DOMAIN = "localhost:8080";

// 動態生成 WebSocket 網址
// Vercel 使用 HTTPS，所以必須用 wss:// (Secure WebSocket)
// 本地開發使用 ws://
const getWebSocketUrl = () => {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    return `${protocol}${BACKEND_DOMAIN}/ws`;
};

// 動態生成 API 基礎網址
const getApiBaseUrl = () => {
    const protocol = window.location.protocol === "https:" ? "https://" : "http://";
    return `${protocol}${BACKEND_DOMAIN}`;
};
// ============================================================================


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
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  onBack,
  currentUserId: propUserId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // 1. 取得當前使用者 ID
  const { data: currentUserData } = useGetCurrentUser();
  const currentUserId = propUserId || currentUserData?.data?.id || "";

  const state = location.state as ChatLocationState | null;
  const returnToCheckout = state?.returnToCheckout || false;
  const checkoutData = state?.checkoutData;
  const targetSellerId = state?.sellerId;
  const targetSellerName = state?.sellerName;

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // 2. 初始化 WebSocket 連線
  useEffect(() => {
    if (!currentUserId) return;

    // 使用動態取得的 URL
    const wsUrl = getWebSocketUrl();
    console.log("嘗試連線至 WebSocket:", wsUrl);

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("✅ WebSocket 連線成功");
        setIsConnected(true);
        // 訂閱個人訊息頻道
        client.subscribe(`/topic/user/${currentUserId}`, (message) => {
            if (message.body) {
                const msgData = JSON.parse(message.body);
                handleIncomingMessage(msgData);
            }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 錯誤:", frame.headers["message"]);
        console.error("詳細資訊:", frame.body);
      },
      onWebSocketClose: () => {
        console.log("⚠️ WebSocket 連線中斷");
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [currentUserId]);

  // 3. 處理接收到的即時訊息
  // 注意：這裡使用 useRef 解決閉包問題，確保能在 callback 中讀取到最新的 selectedRoom
  // 或是保持你原本的寫法，但要小心 selectedRoom 在 useEffect 中的依賴性
  // 這裡為了簡化，保留你原本的邏輯，但建議 handleIncomingMessage 用 useCallback 包起來或放在 useEffect 內
  const handleIncomingMessage = (msgPayload: any) => {
    const incomingMsg: Message = {
        messageId: msgPayload.id || `live_${Date.now()}`,
        senderId: String(msgPayload.senderId),
        senderName: "對方",
        content: msgPayload.content,
        timestamp: msgPayload.timestamp || new Date().toISOString(),
        isRead: false
    };

    setMessages(prev => {
        // 使用 functional update 可以拿到當下最新的 state，
        // 但這裡無法拿到當下的 selectedRoom，這是 React 常見閉包陷阱。
        // 不過因為你是在 setMessages 內部判斷，這裡其實只能拿到 prev messages。
        // 如果要判斷 selectedRoom，建議改用「收到訊息就存入」，渲染時再濾，或是用 ref 存 selectedRoomId。

        // 暫時解法：因為 STOMP callback 是在 useEffect 定義的，它會鎖住當時的 scope。
        // 但因為我們只訂閱了自己的 queue，所有來的訊息都是給我的。
        // 所以可以先全部收下來，UI 層再決定要不要顯示 (或標示未讀)。

        // 為了不破壞你原本邏輯，這裡做個小調整：直接加進去，顯示層過濾
        return [...prev, incomingMsg];
    });
  };

  // 4. 初始化聊天室列表
// 修改 index.tsx 的 initRooms 部分

// 修改 index.tsx

  useEffect(() => {
    const initRooms = async () => {
        if (!currentUserId) return;

        try {
            // 1. 從後端撈取「已存在的聊天室」
            const res = await axios.get(`${getApiBaseUrl()}/api/chat-rooms/${currentUserId}`);
            let rooms: ChatRoom[] = [];

            if (Array.isArray(res.data)) {
                rooms = res.data.map((dto: any) => {
                    return {
                        roomId: dto.roomId,
                        otherUser: {
                            userId: dto.otherUserId,     // 對應 DTO 的 otherUserId
                            userName: dto.otherUserName, // ✅ 對應 DTO 的 otherUserName (現在是真實名字了!)
                            isOnline: false
                        },
                        unreadCount: 0
                    };
                });
            }

            // 2. 設定列表
            setChatRooms(rooms);

            // 3. 處理「指定聊天對象」的情況 (從結帳/商品頁跳轉)
            if (targetSellerId) {
                // 🔥 關鍵修正：先用 find 找找看，列表裡是不是已經有這個人了？
                const existingRoom = rooms.find(r => r.otherUser.userId === targetSellerId);

                if (existingRoom) {
                    // ✅ 找到了！直接選取舊房間，不要創建新的
                    console.log("找到現有房間，切換中...");
                    setSelectedRoom(existingRoom);
                } else {
                    // ❌ 沒找到，這才是真正的「第一次聊天」，才建立暫時房間
                    console.log("建立新房間...");
                    const newRoom: ChatRoom = {
                        roomId: `temp_${Date.now()}`, // 暫時 ID，送出第一則訊息後後端會生成正式 ID
                        otherUser: {
                            userId: targetSellerId,
                            userName: targetSellerName || `賣家 ${targetSellerId}`,
                            isOnline: true
                        },
                        unreadCount: 0
                    };
                    setChatRooms(prev => [newRoom, ...prev]);
                    setSelectedRoom(newRoom);
                }
            } else if (rooms.length > 0) {
                // 沒有指定對象，預設選第一個
                setSelectedRoom(rooms[0]);
            }

        } catch (error) {
            console.error("載入聊天列表失敗", error);
        }
    };

    initRooms();
  }, [currentUserId, targetSellerId, targetSellerName]);

  // 5. 獲取歷史訊息 (REST API)
  useEffect(() => {
    if (selectedRoom && currentUserId) {
        fetchMessages(currentUserId, selectedRoom.otherUser.userId);
    }
  }, [selectedRoom, currentUserId]);

  const fetchMessages = async (senderId: string, recipientId: string) => {
    try {
      setLoading(true);
      // 使用動態 API 基礎網址
      const apiUrl = `${getApiBaseUrl()}/api/messages/${senderId}/${recipientId}`;
      const response = await axios.get(apiUrl);

      if (Array.isArray(response.data)) {
          const mappedMessages: Message[] = response.data.map((msg: any) => ({
              messageId: msg.id || `hist_${Math.random()}`,
              senderId: String(msg.senderId),
              senderName: String(msg.senderId) === senderId ? "我" : (selectedRoom?.otherUser.userName || "對方"),
              content: msg.content,
              timestamp: msg.timestamp,
              isRead: true
          }));
          setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("載入歷史訊息失敗:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // 滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedRoom || !content.trim() || !currentUserId) return;

    if (stompClientRef.current && isConnected) {
        const payload = {
            senderId: currentUserId,
            recipientId: selectedRoom.otherUser.userId,
            content: content.trim()
        };

        stompClientRef.current.publish({
            destination: "/app/chat",
            body: JSON.stringify(payload)
        });
    } else {
        console.warn("WebSocket 未連線，無法發送訊息");
        alert("連線中斷，請稍後再試");
        return;
    }

    const newMessage: Message = {
      messageId: `temp_${Date.now()}`,
      senderId: currentUserId,
      senderName: "我",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSelectRoom = (room: ChatRoom) => setSelectedRoom(room);

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

  // 這裡過濾顯示的訊息：只顯示當前房間的訊息
  const displayedMessages = messages.filter(msg => {
      if (!selectedRoom) return false;
      // 顯示條件：(發送者是對象 AND 接收者是我) OR (發送者是我 AND 接收者是對象)
      // 但因為你的 Message 結構只有 senderId，我們假設前端只存了「當前這個房間的聊天記錄」。
      // 如果你的 messages state 是混合了所有人的訊息，這裡需要過濾。
      // 簡單判斷：只顯示 senderId 是對方或自己的
      return msg.senderId === selectedRoom.otherUser.userId || msg.senderId === currentUserId;
  });

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
        />

        <div className="chat-main">
          {selectedRoom ? (
            <>
              {!isConnected && <div className="chat-connection-status">連線中...</div>}
              {loading ? (
                  <div className="chat-loading">載入訊息中...</div>
              ) : (
                  <MessageList
                    messages={displayedMessages} // 使用過濾後的訊息
                    currentUserId={currentUserId}
                    messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                  />
              )}
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