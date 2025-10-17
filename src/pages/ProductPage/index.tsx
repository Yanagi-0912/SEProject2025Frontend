import React from 'react';
import Header from './Header';

interface ProductProps {
    productID: string;
    productType: string;  
    onBack?: () => void;
    sellerNickname: string;
    productName: string;
    productDescription: string;
    productPrice: number;
    productImage: string;
    productCategory: string;
    productStatus: 'available' | 'sold_out' | 'discontinued';
    viewCount: number;
    reviewCount: number;
    totalSales: number;
}

const ProductPage: React.FC = () => {
    // API
    const product: ProductProps = {
        productID: "商品ID",
        productType: "商品類型(直購/拍賣)",
        onBack: () => { console.log("返回主頁"); },
        sellerNickname: "賣家暱稱",
        productName: "商品名稱",
        productDescription: "商品描述",
        productPrice: 100,
        productImage: "商品圖片URL",
        productCategory: "商品類別",
        productStatus: "available",
        viewCount: 1000,
        reviewCount: 100,
        totalSales: 100
    };

    
    

    return (
      <div>
        <Header onBack={product.onBack} />
        


      </div>
    );
};

export default ProductPage;

