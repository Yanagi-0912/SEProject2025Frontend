
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
        <div>{props.productName} - ${props.productPrice}</div>
      </div>
    );
}

export default AuctionProduct;