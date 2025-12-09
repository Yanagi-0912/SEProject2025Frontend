import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import ControlPanel from './ControlPanel';
import { useGetCurrentUser, useUpdatePassword, type Product } from '../../api/generated';

interface UserProps {
  id: string;               // 使用者ID
  username: string;         // 使用者名稱
  email: string;            // 使用者電子郵件
  nickname: string;         // 使用者暱稱
  phoneNumber: string;      // 使用者電話
  address: string;          // 使用者地址
  averageRating?: number;   // 使用者平均評分
  ratingCount?: number;     // 使用者評分數量
  isBanned?: boolean;      // 使用者是否被封鎖
  sellingProducts?: Product[]; // 使用者正在販售的商品
}

const SAMPLE_USER: UserProps = {
    id: 'TestUser01',
    username: 'testuser',
    email: 'testuser@example.com',
    nickname: '測試用戶',
    phoneNumber: '0912345678',
    address: '台北市中正區仁愛路一段1號',
    averageRating: 4.5,
    ratingCount: 120,
};

const MyProfilePage: React.FC = () => {
	const navigate = useNavigate();

	const [user, setUser] = useState<UserProps>(SAMPLE_USER);
	const [error, setError] = useState<string | null>(null);

	const userQuery = useGetCurrentUser();
	const updatePasswordMutation = useUpdatePassword();

	useEffect(() => {
		if (userQuery.isLoading) return;

		if (userQuery.data && userQuery.data.data) {
			const fetched = userQuery.data.data;
			const normalize = (src: unknown): Partial<UserProps> => {
				const s = src as Record<string, unknown>;
				const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? undefined : String(v));
				const asNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : undefined);
				
				const username = asString(s['username']);
				const nickname = asString(s['nickname']);
				
				return {
					id: asString(s['id']),
					username: username,
					email: asString(s['email']),
					nickname: nickname || username, // 若暱稱為空則使用 username
					phoneNumber: asString(s['phoneNumber']),
					address: asString(s['address']),
					averageRating: asNumber(s['averageRating']),
					ratingCount: asNumber(s['ratingCount']),
				};
			};

			setUser(prev => ({ ...prev, ...normalize(fetched) } as UserProps));
			setError(null);
		} else if (userQuery.isError) {
			const msg = userQuery.error ? String((userQuery.error as Error).message) : '取得使用者失敗';
			console.error('fetch user error', userQuery.error);
			setError(msg);
			setUser(SAMPLE_USER);
		}
	}, [userQuery.data, userQuery.isError, userQuery.error, userQuery.isLoading]);

	const handleCouponsClick = () => {
		navigate('/profile/coupons');
	};

	const handleChangePasswordClick = async () => {
		const currentPassword = prompt('請輸入目前密碼：');
		if (!currentPassword) {
			return; // 使用者取消
		}

		const newPassword = prompt('請輸入新密碼：');
		if (!newPassword) {
			return; // 使用者取消
		}
		
		if (newPassword === currentPassword) {
			alert('新密碼不能與目前密碼相同，請重新操作');
			return;
		}

		const confirmPassword = prompt('請再次輸入新密碼：');
		if (!confirmPassword) {
			return; // 使用者取消
		}

		if (newPassword !== confirmPassword) {
			alert('兩次輸入的新密碼不一致，請重新操作');
			return;
		}

		if (newPassword.length < 6) {
			alert('新密碼長度至少需要 6 個字元');
			return;
		}

		try {
			await updatePasswordMutation.mutateAsync({
				data: {
					currentPassword: currentPassword,
					newPassword: newPassword
				}
			});
			alert('密碼已成功更新！');
		} catch (error) {
			console.error('修改密碼失敗:', error);
			alert('修改密碼失敗，請確認目前密碼是否正確');
		}
	};

	const handleSellerDashboardClick = () => {
		navigate('/seller/dashboard');
	};

	const handleHistoryClick = () => {
		console.log('查看歷史紀錄');
		// TODO: 導航到歷史紀錄頁面
		alert('歷史紀錄功能開發中...');
	};

	const handleUpdateSuccess = () => {
		// 重新獲取使用者資料
		userQuery.refetch();
	};

	if (userQuery.isLoading) {
		return (
			<div className="user-profile-loading">
				<div className="loading-spinner"></div>
				<p>載入中...</p>
			</div>
		);
	}

	return (
		<div className="user-profile-page-wrapper">
			<Header />
			{error && (
				<div className="error-banner">
					⚠️ 錯誤：{error} — 使用範例使用者顯示
				</div>
			)}
			
			<div className="user-profile-content">
				<div className="profile-main-container">
					{/* 個人資料卡片 */}
					<UserProfile 
						{...user} 
						onUpdateSuccess={handleUpdateSuccess}
					/>
					
					{/* 控制面板 */}
					<ControlPanel
						onCouponsClick={handleCouponsClick}
						onChangePasswordClick={handleChangePasswordClick}
						onSellerDashboardClick={handleSellerDashboardClick}
						onHistoryClick={handleHistoryClick}
					/>
				</div>
			</div>
		</div>
	);
};

export default MyProfilePage;

