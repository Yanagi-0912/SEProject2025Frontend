import './Seller.css';

interface SellerProps {
    sellerID?: string;
}

interface SellerInfo {
    userId: string;
    userNickname: string;
    averageRating: number;
    ratingCount: number;
}

function Seller(props: SellerProps) {
    // API
    const info : SellerInfo = {
        userId: props.sellerID || '000000',
        userNickname: '000000',
        averageRating: 0,
        ratingCount: 0
    };

    return (
        <div>
            <div className="seller-card">
                <h3>賣家資訊</h3>
                {info && (
                    <div>
                        <div className="seller-nickname">暱稱: {info.userNickname}</div>
                        <div>平均評分: {info.averageRating}</div>
                        <div>評分次數: {info.ratingCount}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Seller;