import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import DirectProduct from './DireectProduct';
import AuctionProduct from './AuctionProduct';
import Seller from './Seller';
import Details from './Details';
import { useGetProductById } from '../../api/generated';


interface ProductProps {
    productID?: string;               // 產品ID
    sellerID?: string;                // 賣家ID
    productName?: string;             // 產品名稱
    productDescription?: string;      // 產品描述
    productPrice?: number;            // 產品價格
    productImage?: string;            // 產品圖片URL
    productType?: 'DIRECT' | 'AUCTION' | string; // 產品類型
    productStock?: number;            // 產品庫存量
    productCategory?: string;         // 產品類別
    productStatus?: ProductStatuses | string;// 產品狀態
    createdTime?: string;             // 產品建立時間
    updatedTime?: string;             // 產品更新時間
    auctionEndTime?: string;          // 拍賣結束時間 (僅限拍賣產品)
    nowHighestBid?: number;           // 目前最高出價
    highestBidderID?: string;         // 目前最高出價者ID
    viewCount?: number;               // 產品瀏覽次數
    averageRating?: number;           // 產品平均評分
    reviewCount?: number;             // 產品評論數量
	totalSales?: number;              // 產品總銷售量
}

type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';

const SAMPLE_PRODUCT: ProductProps = {
	productID: '12345',
	sellerID: '67890',
	productName: '商品名稱',
	productDescription: '商品描述',
	productPrice: 100,
	productImage: '商品圖片URL',
	productType: 'AUCTION',
	productStock: 1,
	productCategory: '商品類別',
	productStatus: 'ACTIVE',
	createdTime: '2023-01-01',
	updatedTime: '2023-01-02',
	auctionEndTime: '2023-12-31',
	nowHighestBid: 150,
	highestBidderID: '54321',
	viewCount: 1000,
	averageRating: 4.5,
	reviewCount: 100,
	totalSales: 100,
};

const ProductPage: React.FC<{ productID?: string }> = ({ productID }) => {
	const params = useParams<{ id: string }>();

	const [product, setProduct] = useState<ProductProps>(SAMPLE_PRODUCT);
	const [error, setError] = useState<string | null>(null);

	// 取得 id（優先 props，接著路由參數，再來 query string）
	const urlParams = new URLSearchParams(window.location.search);
	const id = productID ?? params.id ?? urlParams.get('id') ?? '';

	// useGetProductById 預設會在 id falsy 時 disabled
	const productQuery = useGetProductById(id);

	useEffect(() => {
		if (productQuery.isLoading) return;

		if (productQuery.data && productQuery.data.data) {
			const fetched = productQuery.data.data;
			const normalize = (src: unknown): Partial<ProductProps> => {
				const s = src as Record<string, unknown>;
				const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? undefined : String(v));
				const asNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : undefined);
				return {
					productID: asString(s['productID'] ?? s['ProductID'] ?? s['_id'] ?? s['id']),
					sellerID: asString(s['sellerID'] ?? s['SellerID']),
					productName: asString(s['productName'] ?? s['ProductName']),
					productDescription: asString(s['productDescription'] ?? s['ProductDescription']),
					productPrice: asNumber(s['productPrice'] ?? s['ProductPrice']),
					productImage: asString(s['productImage'] ?? s['ProductImage']),
					productType: asString(s['productType'] ?? s['ProductType']),
					productStock: asNumber(s['productStock'] ?? s['ProductStock']),
					productCategory: asString(s['productCategory'] ?? s['ProductCategory']),
					productStatus: asString(s['productStatus'] ?? s['ProductStatus']),
					createdTime: asString(s['createdTime'] ?? s['CreatedTime']),
					updatedTime: asString(s['updatedTime'] ?? s['UpdatedTime']),
					auctionEndTime: asString(s['auctionEndTime'] ?? s['AuctionEndTime']),
					nowHighestBid: asNumber(s['nowHighestBid'] ?? s['NowHighestBid']),
					highestBidderID: asString(s['highestBidderID'] ?? s['HighestBidderID']),
					viewCount: asNumber(s['viewCount'] ?? s['ViewCount']),
					averageRating: asNumber(s['averageRating'] ?? s['AverageRating']),
					reviewCount: asNumber(s['reviewCount'] ?? s['ReviewCount']),
					totalSales: asNumber(s['totalSales'] ?? s['TotalSales']),
				};
			};

			setProduct(prev => ({ ...prev, ...normalize(fetched) } as ProductProps));
			setError(null);
		} else if (productQuery.isError) {
			const msg = productQuery.error ? String((productQuery.error as Error).message) : '取得商品失敗';
			console.error('fetch product error', productQuery.error);
			setError(msg);
			setProduct(SAMPLE_PRODUCT);
		}
	}, [productQuery.data, productQuery.isError, productQuery.error, productQuery.isLoading]);

	if (productQuery.isLoading) {
		return <div>載入中...</div>;
	}

	return (
		<div>
			<Header />
			{error && (
				<div style={{ color: 'orange', padding: '8px' }}>
					錯誤：{error} — 使用範例商品顯示
				</div>
			)}
			{product.productType === 'DIRECT' ? (

				<DirectProduct 
					productID={product.productID}
					productName={product.productName}
					productDescription={product.productDescription}
					productPrice={product.productPrice}
					productImage={product.productImage}
					productStock={product.productStock}
					productStatus={product.productStatus}
					averageRating={product.averageRating}
				/>
			) : (
				<AuctionProduct 
					productName={product.productName}
					productDescription={product.productDescription}
					productPrice={product.productPrice}
					productImage={product.productImage}
					productStock={product.productStock}
					productStatus={product.productStatus}
					productID={product.productID}
					averageRating={product.averageRating}
					auctionEndTime={product.auctionEndTime}
					nowHighestBid={product.nowHighestBid}
					highestBidderID={product.highestBidderID}
				/>
			)}
			<Seller sellerID={product.sellerID} />
			<Details
				productName={product.productName}
				productDescription={product.productDescription}
				productCategory={product.productCategory}
				productStock={product.productStock}
				productStatus={product.productStatus}
				totalSales={product.totalSales}
				createdTime={product.createdTime}
				updatedTime={product.updatedTime}
			/>
		</div>
	);
};

export default ProductPage;

