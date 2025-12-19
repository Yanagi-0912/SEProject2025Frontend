import axios from 'axios';
import { PRODUCT_API } from '../config/api';

export interface CreateCouponRequest {
  couponName: string;
  description: string;
  expireTime: string; // ISO 8601 format: "2025-12-31T23:59:59"
  couponCount: number;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' | 'BUY_ONE_GET_ONE';
  discountValue: number;
  minPurchaseAmount: number;
  createdTime: string; // ISO 8601 format: "2025-01-01T12:00:00"
  maxUsage: number;
}

export interface CreateCouponResponse {
  couponID: string;
  couponName: string;
  description: string;
  expireTime: string;
  couponCount: number;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' | 'BUY_ONE_GET_ONE';
  discountValue: number;
  minPurchaseAmount: number;
  createdTime: string;
  maxUsage: number;
}

/**
 * 優惠券列表項目
 */
export interface CouponListItem {
  couponID: string;
  couponName: string;
  discount: number;
}

/**
 * 使用者優惠券項目
 */
export interface UserCouponItem {
  couponID: string;
  couponName: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' | 'BUY_ONE_GET_ONE';
  discountValue: number;
  expireTime: string;
  obtainedTime?: string;
  isUsed?: boolean;
}

/**
 * 取得所有優惠券 API
 * GET /api/coupons
 */
export const getAllCoupons = async (): Promise<CouponListItem[]> => {
  const response = await axios.get<CouponListItem[]>(
    `${PRODUCT_API}/api/coupons`
  );
  return response.data;
};

/**
 * 抽獎優惠券回應
 */
export interface DrawCouponResponse {
  userId: string;
  couponID: string;
  remainingUsage: number;
  used: boolean;
}

/**
 * 抽獎優惠券 API
 * POST /api/userCoupon/draw?userId={userId}
 */
export const drawCoupon = async (userId: string): Promise<DrawCouponResponse> => {
  const response = await axios.post<DrawCouponResponse>(
    `${PRODUCT_API}/api/userCoupon/draw?userId=${userId}`
  );
  return response.data;
};

/**
 * 使用一次抽獎次數 API
 * POST /api/lottery/useOnce
 */
export const useLotteryOnce = async (): Promise<string> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登入');
  }
  
  const response = await axios.post<string>(
    `${PRODUCT_API}/api/lottery/useOnce`,
    undefined,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data; // 回傳 "Remaining draw times: 9" 格式的字串
};

/**
 * 發放優惠券給使用者 API
 * POST /api/userCoupon/issue?userId={userId}&couponId={couponId}
 */
export const issueUserCoupon = async (userId: string, couponId: string): Promise<{
  userId: string;
  couponID: string;
  remainingUsage: number;
  used: boolean;
}> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登入');
  }
  
  const response = await axios.post<{
    userId: string;
    couponID: string;
    remainingUsage: number;
    used: boolean;
  }>(
    `${PRODUCT_API}/api/userCoupon/issue?userId=${userId}&couponId=${couponId}`,
    undefined,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * 取得使用者所有優惠券 API
 * GET /api/userCoupon/{userId}
 * 需要：JWT Token
 */
export const getUserCouponsByUserId = async (userId: string): Promise<UserCouponItem[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登入');
  }
  
  const response = await axios.get<UserCouponItem[]>(
    `${PRODUCT_API}/api/userCoupon/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * 取得剩餘抽獎券數量 API（已廢棄，改用 /api/user/me 的 remainingDrawTimes）
 * @deprecated 請使用 useGetCurrentUser 取得 remainingDrawTimes
 */
export const getRemainingDrawTickets = async (): Promise<number> => {
  try {
    const response = await axios.get<{ remainingTickets: number }>(
      `${PRODUCT_API}/api/userCoupon/draw/remaining`
    );
    return response.data.remainingTickets;
  } catch (error) {
    console.error('取得剩餘抽獎券數量失敗:', error);
    return 0;
  }
};

/**
 * 建立優惠券 API
 * POST /api/coupons
 */
export const createCoupon = async (
  data: CreateCouponRequest
): Promise<CreateCouponResponse> => {
  const response = await axios.post<CreateCouponResponse>(
    `${PRODUCT_API}/api/coupons`,
    data
  );
  return response.data;
};
