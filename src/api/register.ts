import { PRODUCT_API } from '../config/api';

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

/**
 * 註冊 API
 * POST {PRODUCT_API}/api/auth/register
 */
export const register = async (
  userData: RegisterRequest
): Promise<void> => {
  const response = await fetch(`${PRODUCT_API}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    // 使用 text() 而不是 json() 來處理錯誤訊息
    const errorMessage = await response.text();
    throw new Error(errorMessage || '註冊失敗');
  }
};

