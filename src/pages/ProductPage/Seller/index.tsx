interface SellerProps {
    sellerID?: string;
    onBack?: () => void;
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
        userId: '000000',
        userNickname: '000000',
        averageRating: 0,
        ratingCount: 0
    };

    return (
        <div>
            <h3>賣家資訊</h3>
            <div>賣家ID: {props.sellerID}</div>
            {info && (
                <div>
                    <div>暱稱: {info.userNickname}</div>
                    <div>平均評分: {info.averageRating}</div>
                    <div>評分次數: {info.ratingCount}</div>
                </div>
            )}
            <div>
                <button onClick={props.onBack}>返回</button>
            </div>
        </div>
    );
}

export default Seller;