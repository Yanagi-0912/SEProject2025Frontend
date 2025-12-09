import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import { useGetUserById, type Product } from '../../api/generated/index';

interface UserProps {
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
			const normalize = (src: unknown): Partial<UserProps> => {
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

			setUser(prev => ({ ...prev, ...normalize(fetched) } as UserProps));
			setError(null);
		} else if (isError) {
			const msg = queryError ? String((queryError as Error).message) : '取得使用者失敗';
			console.error('fetch user error', queryError);
			setError(msg);
			setUser(SAMPLE_USER);
		}
	}, [userQueryData, isError, queryError, isLoading, userId]);

	if (isLoading) {
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

