
interface AuctionProps {
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    productImage?: string;
    productStock?: number;
    productStatus?: ProductStatuses | string;
    averageRating?: number;
    auctionEndTime?: string;
    nowHighestBid?: number;
    highestBidderID?: string;
    onBack?: () => void;
}

type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';


function AuctionProduct(props: AuctionProps) {
    return (
      <div>
        拍賣商品頁面
        <div><img src={props.productImage} alt={props.productName} /></div>
        <div>產品名稱: {props.productName}</div>
        <div>產品描述: {props.productDescription}</div>
        <div>產品價格: ${props.productPrice}</div>
        <div>庫存數量: {props.productStock}</div>
        <div>目前狀態: {props.productStatus}</div>
        <div>平均評分: {props.averageRating}</div>
        <div>拍賣結束時間: {props.auctionEndTime}</div>
        <div>目前最高出價: ${props.nowHighestBid}</div>
        <div>最高出價者ID: {props.highestBidderID}</div>
      </div>
    );
}

export default AuctionProduct;