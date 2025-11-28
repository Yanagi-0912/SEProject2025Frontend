import './Seller.css';
import { useGetUserById } from '../../../api/generated';

interface SellerProps {
    sellerID: string;
}

function Seller({ sellerID }: SellerProps) {
    const { data: sellerData, isLoading, error } = useGetUserById(sellerID);
    const seller = sellerData?.data;

    if (isLoading) {
        return (
            <div className="seller-card">
                <h3>賣家資訊</h3>
                <div>載入中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seller-card">
                <h3>賣家資訊</h3>
                <div>載入失敗</div>
            </div>
        );
    }

    return (
        <div>
            <div className="seller-card">
                <h3>賣家資訊</h3>
                {seller && (
                    <div>
                        <div className="seller-nickname">{seller.nickname || seller.username || '未設定'}</div>
                        <div>平均評分: ⭐ {seller.averageRating?.toFixed(1) ?? 'N/A'}</div>
                        <div>評分次數: {seller.ratingCount ?? 0} 次</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Seller;