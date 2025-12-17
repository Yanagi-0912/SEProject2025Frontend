import { useState } from 'react';
import type { UserProps } from '../../../types/user';
import ProfileEditForm from './ProfileEditForm';

function UserProfile(profile: UserProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {/* 用戶基本資訊 */}
      <h1>{profile.username}</h1>
      <p>{profile.email}</p>
      
      {/* 評分資訊 */}
      <div>
        <span>平均評分</span>
        <span>⭐ {profile.averageRating?.toFixed(1) ?? '尚無評分'}</span>
      </div>
      <div>
        <span>評分次數</span>
        <span>{profile.ratingCount ?? 0} 次</span>
      </div>
      
      {/* 操作按鈕 */}
      {!isEditing && (
        <button onClick={handleEdit}>
          編輯個人資料
        </button>
      )}

      {/* 內容區域 */}
      <h2>基本資訊</h2>
      
      {!isEditing ? (
        // 顯示模式
        <>
          <div>
            <span>暱稱</span>
            <span>{profile.nickname || '未設定'}</span>
          </div>
          <div>
            <span>Email</span>
            <span>{profile.email || '未設定'}</span>
          </div>
          <div>
            <span>電話</span>
            <span>{profile.phoneNumber || '未填寫'}</span>
          </div>
          <div>
            <span>地址</span>
            <span>{profile.address || '未填寫'}</span>
          </div>
        </>
      ) : (
        // 編輯模式
        <ProfileEditForm 
          profile={profile} 
          onCancel={handleCancel}
          onSaveSuccess={handleCancel}
        />
      )}
    </div>
  );
};

export default UserProfile;

