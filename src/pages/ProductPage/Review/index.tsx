import { useState } from 'react';
import './Review.css';
import { useCreateReview, type Review as ReviewType } from '../../../api/generated';

interface ReviewProps {
    productID: string;
    reviews?: ReviewType[];
}

function Review({ productID, reviews = [] }: ReviewProps) {
    const [starCount, setStarCount] = useState(5);
    const [comment, setComment] = useState('');
    const [imgURL, setImgURL] = useState('');
    const createReviewMutation = useCreateReview();

    const handleSubmit = async () => {
        if (!comment.trim()) {
            alert('請輸入評論內容');
            return;
        }

        try {
            await createReviewMutation.mutateAsync({
                data: {
                    productID,
                    starCount: starCount,
                    comment: comment.trim(),
                    imgURL: imgURL.trim() || undefined,
                }
            });

            alert('評論提交成功！');
            setComment('');
            setImgURL('');
            setStarCount(5);
        } catch (error) {
            console.error('提交評論失敗:', error);
            alert('提交評論失敗，請稍後再試');
        }
    };

    const renderStars = (count: number, interactive: boolean = false) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= count ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                        onClick={() => interactive && setStarCount(star)}
                    >
                        ⭐
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="review-container">
            <div className="review-input-container">
                <h3>留下您的評論</h3>
                
                <div className="rating-input">
                    <label>評分：</label>
                    {renderStars(starCount, true)}
                    <span className="rating-text">{starCount} / 5</span>
                </div>

                <div className="comment-input">
                    <textarea 
                        placeholder="請輸入您的評論內容..." 
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <div className="image-input">
                    <input 
                        type="url"
                        placeholder="圖片網址 (選填)"
                        value={imgURL}
                        onChange={(e) => setImgURL(e.target.value)}
                    />
                </div>

                <div className="submit-section">
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={createReviewMutation.isPending}
                        className="submit-review-btn"
                    >
                        {createReviewMutation.isPending ? '提交中...' : '提交評論'}
                    </button>
                </div>
            </div>

            <div className="review-list-container">
                <h3>商品評論 ({reviews.length})</h3>
                
                {reviews.length === 0 ? (
                    <div className="no-reviews">
                        目前還沒有評論，成為第一個評論者吧！
                    </div>
                ) : (
                    <div className="review-list">
                        {reviews.map((review) => (
                            <div key={review.reviewID} className="review-item">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <span className="reviewer-name">{review.userName || '匿名用戶'}</span>
                                        <span className="review-date">
                                            {review.createdTime ? new Date(review.createdTime).toLocaleDateString('zh-TW') : ''}
                                        </span>
                                    </div>
                                    {renderStars(review.starCount ?? 0)}
                                </div>
                                
                                <div className="review-content">
                                    <p>{review.comment}</p>
                                    {review.imgURL && (
                                        <div className="review-image">
                                            <img src={review.imgURL} alt="評論圖片" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Review;