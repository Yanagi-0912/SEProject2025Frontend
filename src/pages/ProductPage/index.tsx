import React, { useEffect, useState } from 'react';
import Header from './Header';
import DirectProduct from './DireectProduct';
import AuctionProduct from './AuctionProduct';
import Seller from './Seller';
import Details from './Details';


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
    onBack?: () => void;
}

type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';

const ProductPage: React.FC<{ onBack?: () => void }> = () => {
    const sampleProduct: ProductProps = {
		productID: '12345',
		sellerID: '67890',
		productName: '商品名稱',
		productDescription: '商品描述',
		productPrice: 100,
		productImage: '商品圖片URL',
		productType: 'DIRECT',
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
		onBack: () => { console.log('返回主頁'); }
	};

	const [product, setProduct] = useState<ProductProps>(sampleProduct);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// 先嘗試從 URL query 取得 id，若無則不呼叫 API
		const params = new URLSearchParams(window.location.search);
		const id = params.get('id');

		if (!id) {
			return;
		}

		const controller = new AbortController();
		const fetchProduct = async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await fetch(`http://localhost:8080/products/?id=${encodeURIComponent(id)}`, {
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
				// 假設 API 回傳單一 product 物件或陣列的第一個元素
				const fetched = Array.isArray(data) ? data[0] : data;
				if (fetched) {
					// 將後端可能使用的 PascalCase 或其他欄位對映到元件使用的 camelCase
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
				} else {
					setError('未找到對應商品');
				}
			} catch (err: unknown) {
				// 若是由於取消 (Abort) 導致的錯誤，不處理
				if (controller.signal.aborted) return;
				const msg = err instanceof Error ? err.message : '取得商品失敗';
				setError(msg);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
		return () => controller.abort();
	}, []);

	if (loading) {
		return <div>載入中...</div>;
	}

	if (error) {
		return <div>錯誤：{error}</div>;
	}

	return (
		<div>
			<Header page={0} onBack={product.onBack} />
			{product.productType === 'DIRECT' ? (

				<DirectProduct 
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

