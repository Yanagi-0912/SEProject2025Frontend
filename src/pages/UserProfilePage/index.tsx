import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../Main/Header';
import UserProfile from './UserProfile';
import ProductList from './ProductList';
import { useGetUserById } from '../../api/generated/index';
import { useGetSellerProducts, useGetSellerActiveProducts } from '../../api/seller';
import { SAMPLE_USER, normalizeUserData, type UserProps } from '../../types/user';
import './index.css';

const UserProfilePage: React.FC = () => {
	const params = useParams<{ id: string }>();
	const location = useLocation();
	const userId = params.id ?? '';

	const [user, setUser] = useState<UserProps>(SAMPLE_USER);
	const [error, setError] = useState<string | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState<boolean>(false);

	const { data: userQueryData, isLoading, isError, error: queryError } = useGetUserById(userId);

	// 取得賣家的所有商品
	const { 
		data: allProducts, 
		isLoading: isLoadingAllProducts, 
		error: allProductsError 
	} = useGetSellerProducts(userId, {
		query: { enabled: !!userId && !showActiveOnly }
	});

	// 取得賣家的上架商品
	const { 
		data: activeProducts, 
		isLoading: isLoadingActiveProducts, 
		error: activeProductsError 
	} = useGetSellerActiveProducts(userId, {
		query: { enabled: !!userId && showActiveOnly }
	});

	// 從 location.state 取得商品 ID
	const productId = (location.state as { productId?: string })?.productId;
	const backUrl = productId ? `/product/${productId}` : undefined;

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

	// 決定要顯示的商品和載入狀態
	const products = showActiveOnly ? activeProducts : allProducts;
	const isLoadingProducts = showActiveOnly ? isLoadingActiveProducts : isLoadingAllProducts;
	const productsError = showActiveOnly ? activeProductsError : allProductsError;

	return (
		<div className="user-profile-page-wrapper">
			<Header backUrl={backUrl} />
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

				{/* 商品列表切換按鈕 */}
				<div className="product-list-toggle">
					<button
						className={`toggle-button ${!showActiveOnly ? 'active' : ''}`}
						onClick={() => setShowActiveOnly(false)}
					>
						所有商品
					</button>
					<button
						className={`toggle-button ${showActiveOnly ? 'active' : ''}`}
						onClick={() => setShowActiveOnly(true)}
					>
						上架商品
					</button>
				</div>

				{/* 商品列表 */}
				<ProductList 
					products={products || []}
					isLoading={isLoadingProducts}
					error={productsError as Error | null}
				/>
			</div>
		</div>
	);
};

export default UserProfilePage;

