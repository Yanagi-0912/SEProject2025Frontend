import React from 'react';
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

const ProductPage: React.FC = () => {
    // API
    const product: ProductProps = {
		productID: '12345',
		sellerID: '67890',
		productName: '商品名稱',
		productDescription: '商品描述',
		productPrice: 100,
		productImage: '商品圖片URL',
		productType: 'DIRECT',
		productStock: 50,
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
		onBack: () => { console.log("返回主頁"); }
    };

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

