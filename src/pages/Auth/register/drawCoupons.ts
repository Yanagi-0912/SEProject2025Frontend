import { getCurrentUser } from '../../../api/generated';
import { drawCoupon } from '../../../api/coupon';

/**
 * 註冊後抽獎十次
 * @param userId 使用者 ID
 */
export const drawCouponsAfterRegister = async (userId: string): Promise<void> => {
  // 呼叫 /api/userCoupon/draw 十次
  await Promise.all([
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId),
    drawCoupon(userId)
  ]);
};

/**
 * 註冊後完整流程：取得使用者 ID 並抽獎十次
 * @returns 是否成功
 */
export const handlePostRegisterDraw = async (): Promise<boolean> => {
  try {
    // 使用 token 取得使用者 ID
    const userResponse = await getCurrentUser();
    const userId = userResponse.data.data?.id;

    if (!userId) {
      throw new Error('無法取得使用者 ID');
    }

    // 抽獎十次
    await drawCouponsAfterRegister(userId);
    
    return true;
  } catch (error) {
    console.error('抽獎錯誤:', error);
    return false;
  }
};
