import { useNavigate } from 'react-router-dom'
import './DireectProduct.css';
import { useState, useEffect } from 'react';

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
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState<number>(() => {
        const stock = props.productStock;
        return (typeof stock === 'number') ? Math.min(1, Math.max(0, stock)) : 1;
    });
    // 當 props.productStock 改變時調整 quantity（不超過庫存，若庫存為 0 設為 0）
    useEffect(() => {
        const stock = props.productStock;
        if (typeof stock === 'number') {
            setQuantity(prev => {
                if (stock <= 0) return 0;
                return Math.min(prev, stock);
            });
        }
    }, [props.productStock]);
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
                        type="button"
                        className="quantityBtn"
                        onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.max(1, prev - 1)); }}
                        disabled={quantity <= 1}
                    > - </button>
                    <div>{quantity}</div>
                    <button
                        type="button"
                        className='quantityBtn'
                        onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.min((props.productStock ?? Infinity), prev + 1)); }}
                        disabled={typeof props.productStock === 'number' ? quantity >= props.productStock : false}
                    > + </button>
                </div>
                <div className='actionButtons'>
                    <button type="button" className="cart-button" disabled={quantity <= 0}>加入購物車</button>
                    <button
                        type="button"
                        className="buy-button"
                        onClick={() => navigate('/cart')}
                        disabled={quantity <= 0}
                    >
                        立即購買
                    </button>
                </div>
            </div>
        ) : (
            <div className='warning-word'>*商品不可購買</div>
        )}
      </div>    
    );
}

export default DirectProduct;