import type { UserProps } from '../../../types/user';
import './UserProfile.css';

function UserProfile(profile: UserProps) {
  return (
    <div className="user-profile-view-container">
      {/* 左側：名字和評分 */}
      <div className="user-profile-view-left">
      <div className="user-profile-view-header">
        <h1>{profile.username}</h1>
        <p>{profile.email}</p>
      </div>
      
      <div className="user-profile-view-rating">
        <div className="user-profile-view-rating-item">
          <span className="user-profile-view-rating-label">平均評分</span>
          <span className="user-profile-view-rating-value">{profile.averageRating?.toFixed(1) ?? '尚無評分'}</span>
        </div>
        <div className="user-profile-view-rating-item">
          <span className="user-profile-view-rating-label">評分次數</span>
          <span className="user-profile-view-rating-value">{profile.ratingCount ?? 0} 次</span>
          </div>
        </div>
      </div>

      {/* 右側：基本資訊 */}
      <div className="user-profile-view-right">
      <div className="user-profile-view-info">
        <h2>基本資訊</h2>
        
        <div className="user-profile-view-info-item">
          <span className="user-profile-view-info-label">暱稱</span>
          <span className="user-profile-view-info-value">{profile.nickname || '未設定'}</span>
        </div>
        <div className="user-profile-view-info-item">
          <span className="user-profile-view-info-label">Email</span>
          <span className="user-profile-view-info-value">{profile.email || '未設定'}</span>
        </div>
        <div className="user-profile-view-info-item">
          <span className="user-profile-view-info-label">電話</span>
          <span className="user-profile-view-info-value">{profile.phoneNumber || '未填寫'}</span>
        </div>
        <div className="user-profile-view-info-item">
          <span className="user-profile-view-info-label">地址</span>
          <span className="user-profile-view-info-value">{profile.address || '未填寫'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

