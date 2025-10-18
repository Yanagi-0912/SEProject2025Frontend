import './Details.css';

interface DetailsProps {
    productName?: string;
    productDescription?: string;
    productCategory?: string;
    productStock?: number;
    productStatus?: ProductStatuses | string;
    totalSales?: number;
    createdTime?: string;
    updatedTime?: string;
    onBack?: () => void;
}
type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';

function Details(props: DetailsProps) {
    return (
      <div>
        <h3>產品詳細資訊</h3>
        <p>產品名稱: {props.productName}</p>
        <p>詳細描述: {props.productDescription}</p>
        <p>產品類別: {props.productCategory}</p>
        <p>庫存數量: {props.productStock}</p>
        <p>目前狀態: {props.productStatus}</p>
        <p>總銷售量: {props.totalSales}</p>
        <p>建立時間: {props.createdTime}</p>
        <p>更新時間: {props.updatedTime}</p>
      </div>
    );
}

export default Details;