
import './AuctionProduct.css';

interface AuctionProps {
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    productImage?: string;
    productStock?: number;
  productID?: string;
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
      <div className="product-card">
        <div><img src={props.productImage} alt={props.productName} /></div>
        <div className='product-header'>
          <div className="product-title"> {props.productName}</div>
          <div className="product-rating">平均評分: {props.averageRating}</div>
        </div>
        <div className='product-status'>
          <div>拍賣結束時間: {props.auctionEndTime}</div>
          <div>目前狀態: {props.productStatus === 'ACTIVE' ? '上架中' : props.productStatus === 'INACTIVE' ? '下架中' : props.productStatus === 'SOLD' ? '已售出' : '已禁用'}</div>
        </div>
        <div className='product-price'>
          <div>直購價格: ${props.productPrice}</div>
          <div>目前最高出價: ${props.nowHighestBid}</div>
        </div>
        {props.productStatus === 'ACTIVE' ? (
              <div className='actionPanel'>
                  <input type='text' placeholder='輸入出價金額' className='bidInput'/>
                  <button className="bid-button">加入競標</button>
              </div>
        ) : (
            <div className='warning-word'>*商品不可競標</div>
        )}
      </div>
    );
}

export default AuctionProduct;