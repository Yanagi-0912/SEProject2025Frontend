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
        <div className="product-title">產品名稱: {props.productName}</div>
        <div>產品描述: {props.productDescription}</div>
        <div>產品價格: ${props.productPrice}</div>
        <div>庫存數量: {props.productStock}</div>
        <div>目前狀態: {props.productStatus}</div>
        <div>平均評分: {props.averageRating}</div>
      </div>
    );
}

export default DirectProduct;