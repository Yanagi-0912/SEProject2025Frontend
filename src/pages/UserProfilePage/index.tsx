import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import ControlPanel from './ControlPanel';
import './UserProfilePage.css';

interface UserProps {
  id: string;               // 使用者ID
  username: string;         // 使用者名稱
  email: string;            // 使用者電子郵件
  nickname: string;         // 使用者暱稱
  phoneNumber: string;      // 使用者電話
  address: string;          // 使用者地址
  averageRating?: number;   // 使用者平均評分
  ratingCount?: number;     // 使用者評分數量
  onBack?: () => void;
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
	onBack: () => { console.log('返回主頁'); }
};

const UserProfilePage: React.FC<{ userID?: string; onBack?: () => void }> = ({ userID, onBack }) => {
	const params = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [user, setUser] = useState<UserProps>(SAMPLE_USER);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const fetchUser = async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await fetch(`http://localhost:8080/api/user/me}`, {
					method: 'GET',
					signal: controller.signal,
					headers: {
						'Accept': 'application/json'
					}
				});
				if (!resp.ok) {
					throw new Error(`API returned ${resp.status}`);
				}
				const data = await resp.json();
				const fetched = Array.isArray(data) ? data[0] : data;
				if (fetched) {
					const normalize = (src: unknown): Partial<UserProps> => {
						const s = src as Record<string, unknown>;
						const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? undefined : String(v));
						const asNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : undefined);
						return {
							id: asString(s['id']),
                            username: asString(s['username']),
                            email: asString(s['email']),
                            nickname: asString(s['nickname']),
                            phoneNumber: asString(s['phoneNumber']),
                            address: asString(s['address']),
                            averageRating: asNumber(s['averageRating']),
                            ratingCount: asNumber(s['ratingCount']),
						};
					};
					setUser(prev => ({ ...prev, ...normalize(fetched) } as UserProps));
				} else {
					setError('使用者未登入');
				}
			} catch (err: unknown) {
				// 若是由於取消 (Abort) 導致的錯誤，不處理
				if (controller.signal.aborted) return;
				const msg = err instanceof Error ? err.message : '取得使用者失敗';
				console.error('fetch user error', err);
				// 顯示錯誤訊息，但使用 sampleUser 作為回退顯示
				setError(msg);
				setUser(SAMPLE_USER);
			} finally {
				setLoading(false);
			}
			};

		fetchUser();
		return () => controller.abort();
	}, [userID, params.id]);

	const handleCouponsClick = () => {
		navigate('/profile/coupons');
	};

	const handleChangePasswordClick = () => {
		console.log('修改密碼');
		// TODO: 顯示修改密碼對話框
		alert('修改密碼功能開發中...');
	};

	const handleSellerDashboardClick = () => {
		console.log('進入賣家後台');
		// TODO: 導航到賣家後台
		alert('賣家後台功能開發中...');
	};

	const handleHistoryClick = () => {
		console.log('查看歷史紀錄');
		// TODO: 導航到歷史紀錄頁面
		alert('歷史紀錄功能開發中...');
	};

	if (loading) {
		return (
			<div className="user-profile-loading">
				<div className="loading-spinner"></div>
				<p>載入中...</p>
			</div>
		);
	}

	return (
		<div className="user-profile-page-wrapper">
			<Header page={0} onBack={onBack ?? user.onBack} />
			{error && (
				<div className="error-banner">
					⚠️ 錯誤：{error} — 使用範例使用者顯示
				</div>
			)}
			
			<div className="user-profile-content">
				<div className="profile-main-container">
					{/* 個人資料卡片 */}
					<UserProfile {...user} />
					
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

export default UserProfilePage;

