import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import ControlPanel from './ControlPanel';
import { useGetCurrentUser, useUpdatePassword } from '../../api/generated';
import { SAMPLE_USER, normalizeUserData, type UserProps } from '../../types/user';

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
			setUser(prev => ({ ...prev, ...normalizeUserData(fetched) } as UserProps));
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

	return (
		<div>
			<Header />
			{error && (
				<div>
					{error} 請先登入
				</div>
			)}
			
			<div style={{ border: '1px solid red' }}>
				<div style={{ border: '1px solid blue' }}>
				<UserProfile 
					{...user} 
					onUpdateSuccess={handleUpdateSuccess}
				/>
				</div>
				<ControlPanel
					onCouponsClick={handleCouponsClick}
					onChangePasswordClick={handleChangePasswordClick}
					onSellerDashboardClick={handleSellerDashboardClick}
					onHistoryClick={handleHistoryClick}
				/>
			</div>
		</div>
	);
};

export default MyProfilePage;

