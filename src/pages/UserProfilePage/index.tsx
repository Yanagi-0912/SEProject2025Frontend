import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import { useGetUserById } from '../../api/generated/index';
import { SAMPLE_USER, normalizeUserData, type UserProps } from './types';

const UserProfilePage: React.FC = () => {
	const params = useParams<{ id: string }>();
	const userId = params.id ?? '';

	const [user, setUser] = useState<UserProps>(SAMPLE_USER);
	const [error, setError] = useState<string | null>(null);

	const { data: userQueryData, isLoading, isError, error: queryError } = useGetUserById(userId);

	useEffect(() => {
		if (isLoading) return;

		if (userQueryData && userQueryData.data) {
			const fetched = userQueryData.data;
			setUser(prev => ({ ...prev, ...normalizeUserData(fetched, userId) } as UserProps));
			setError(null);
		} else if (isError) {
			const msg = queryError ? String((queryError as Error).message) : '取得使用者失敗';
			console.error('fetch user error', queryError);
			setError(msg);
			setUser(SAMPLE_USER);
		}
	}, [userQueryData, isError, queryError, isLoading, userId]);

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
					{/* 個人資料卡片 - 只讀模式 */}
					<UserProfile 
						{...user}
						readOnly={true}
					/>
					
				</div>
			</div>
		</div>
	);
};

export default UserProfilePage;

