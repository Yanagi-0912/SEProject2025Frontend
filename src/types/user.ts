import type { Product } from '../api/generated';

// 統一的 UserProps interface
export interface UserProps {
  id: string;               // 使用者ID
  username: string;         // 使用者名稱
  email?: string;           // 使用者電子郵件
  nickname: string;         // 使用者暱稱
  phoneNumber?: string;     // 使用者電話
  address?: string;         // 使用者地址
  averageRating?: number;   // 使用者平均評分
  ratingCount?: number;     // 使用者評分數量
  isBanned?: boolean;       // 使用者是否被封鎖
  sellingProducts?: Product[]; // 使用者正在販售的商品
  onUpdateSuccess?: () => void; // 更新成功的回調
  readOnly?: boolean;       // 是否為只讀模式
}

// 範例使用者資料
export const SAMPLE_USER: UserProps = {
  id: 'TestUser01',
  username: 'testuser',
  email: 'testuser@example.com',
  nickname: '測試用戶',
  phoneNumber: '0912345678',
  address: '台北市中正區仁愛路一段1號',
  averageRating: 4.5,
  ratingCount: 120,
};

// 資料正規化函數
export const normalizeUserData = (src: unknown, userId?: string): Partial<UserProps> => {
  const s = src as Record<string, unknown>;
  const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? undefined : String(v));
  const asNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : undefined);
  
  const username = asString(s['username']);
  const nickname = asString(s['nickname']);
  
  return {
    id: asString(s['id']) ?? userId,
    username: username ?? 'unknown',
    email: asString(s['email']),
    nickname: nickname || username || 'unknown', // 若暱稱為空則使用 username
    phoneNumber: asString(s['phoneNumber']),
    address: asString(s['address']),
    averageRating: asNumber(s['averageRating']),
    ratingCount: asNumber(s['ratingCount']),
    isBanned: s['isBanned'] === true,
  };
};
