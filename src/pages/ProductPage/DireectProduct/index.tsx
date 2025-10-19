import './DireectProduct.css';

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
                <button className="cart-button">加入購物車</button>
                <button className="buy-button">立即購買</button>
            </div>
        ) : (
            <div className='warning-word'>*商品不可購買</div>
        )}
      </div>    
    );
}

export default DirectProduct;