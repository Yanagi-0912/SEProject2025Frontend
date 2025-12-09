
interface SellerInfoProps {
  averageRating: number;
  ratingCount: number;
}

const SellerInfo = ({ averageRating, ratingCount }: SellerInfoProps) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="seller-info-card">
      <h2 className="seller-info-title">賣家評價</h2>
      
      <div className="rating-container">
        <div className="rating-display">
          <div className="stars-row">
            {renderStars(averageRating)}
          </div>
          <div className="rating-number">
            {averageRating.toFixed(1)}
          </div>
        </div>
        
        <div className="rating-stats">
          <div className="stat-item">
            <span className="stat-label">評分數量</span>
            <span className="stat-value">{ratingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;
