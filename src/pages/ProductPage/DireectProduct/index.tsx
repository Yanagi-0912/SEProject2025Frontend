import './DireectProduct.css';
import { useState } from 'react';

interface DirectProps {
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    productImage?: string;
    productStock?: number;
    productStatus?: ProductStatuses | string;
    averageRating?: number;
    onBack?: () => void;
}
type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';


function DirectProduct(props: DirectProps) {
    const [quantity, setQuantity] = useState<number>(1);
    return (
        <div className="product-card">
        <div><img src={props.productImage} alt={props.productName} /></div>
        <div className="product-title">{props.productName}</div>
        <div>產品價格: ${props.productPrice}</div>
        <div>庫存數量: {props.productStock}</div>
        <div>目前狀態: {props.productStatus === 'ACTIVE' ? '上架中' : props.productStatus === 'INACTIVE' ? '下架中' : props.productStatus === 'SOLD' ? '已售出' : '已禁用'}</div>
        <div className="product-rating">平均評分: {props.averageRating}</div>
        {props.productStatus === 'ACTIVE' ? (
            <div className='button-card'>
                <div className='setQuantity'>
                    <button
                        className="quantityBtn"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                    > - </button>
                    <div>{quantity}</div>
                    <button
                        className='quantityBtn'
                        onClick={() => setQuantity(prev => Math.min((props.productStock ?? Infinity), prev + 1))}
                        disabled={typeof props.productStock === 'number' ? quantity >= props.productStock : false}
                    > + </button>
                </div>
                <div className='actionButtons'>
                    <button className="cart-button">加入購物車</button>
                    <button className="buy-button">立即購買</button>
                </div>
            </div>
        ) : (
            <div className='warning-word'>*商品不可購買</div>
        )}
      </div>    
    );
}

export default DirectProduct;