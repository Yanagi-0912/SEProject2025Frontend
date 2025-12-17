import { useState } from 'react';
import type { UserProps } from '../../../types/user';
import ProfileEditForm from './ProfileEditForm';
import './UserProfile.css';

function UserProfile(profile: UserProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <h1>{profile.username}</h1>
        <p>{profile.email}</p>
      </div>
      
      <div className="rating-section">
        <div className="rating-item">
          <span className="rating-label">平均評分</span>
          <span className="rating-value">{profile.averageRating?.toFixed(1) ?? '尚無評分'}</span>
        </div>
        <div className="rating-item">
          <span className="rating-label">評分次數</span>
          <span className="rating-value">{profile.ratingCount ?? 0} 次</span>
        </div>
      </div>
      
      {!isEditing && (
        <button className="edit-button" onClick={handleEdit}>
          編輯個人資料
        </button>
      )}

      <div className="basic-info-section">
        <h2>基本資訊</h2>
        
        {!isEditing ? (
          <>
            <div className="info-item">
              <span className="info-label">暱稱</span>
              <span className="info-value">{profile.nickname || '未設定'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email || '未設定'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">電話</span>
              <span className="info-value">{profile.phoneNumber || '未填寫'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">地址</span>
              <span className="info-value">{profile.address || '未填寫'}</span>
            </div>
          </>
        ) : (
          <ProfileEditForm 
            profile={profile} 
            onCancel={handleCancel}
            onSaveSuccess={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;

