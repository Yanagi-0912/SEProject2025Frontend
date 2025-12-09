import { useState } from 'react';
import { useUpdateUser } from '../../../api/generated';

interface UserProps {
  id: string;               // 使用者ID
  username: string;         // 使用者名稱
  email: string;            // 使用者電子郵件
  nickname: string;         // 使用者暱稱
  phoneNumber: string;      // 使用者電話
  address: string;          // 使用者地址
  averageRating?: number;   // 使用者平均評分
  ratingCount?: number;     // 使用者評分數量
  onUpdateSuccess?: () => void; // 更新成功的回調
}

function UserProfile(profile: UserProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProps>(profile);
  const updateUserMutation = useUpdateUser();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    // 驗證必填欄位
    if (!editedProfile.nickname.trim()) {
      alert('請填寫暱稱');
      return;
    }

    // 驗證電話號碼格式（如果有填寫）
    if (editedProfile.phoneNumber && !/^09[0-9]{8}$/.test(editedProfile.phoneNumber)) {
      alert('電話號碼必須是10位數字且前兩碼為09');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        data: {
          nickname: editedProfile.nickname,
          phoneNumber: editedProfile.phoneNumber,
          address: editedProfile.address,
        }
      });
      
      setIsEditing(false);
      alert('個人資料已更新！');
      
      // 通知父組件重新獲取資料
      profile.onUpdateSuccess?.();
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  const handleChange = (field: keyof UserProps, value: string) => {
    // 如果是電話欄位，只允許數字且最多10位
    if (field === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setEditedProfile(prev => ({
          ...prev,
          [field]: digitsOnly
        }));
      }
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {profile?.nickname?.charAt?.(0)?.toUpperCase() ?? '?'}
              </div>
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-username">{profile.username}</h1>
              <p className="profile-email">{profile.email}</p>
            </div>
          </div>
          
          <div className="profile-rating-section">
            <div className="rating-item">
              <span className="rating-label">平均評分</span>
              <span className="rating-value">⭐ {profile.averageRating?.toFixed(1) ?? '尚無評分'}</span>
            </div>
            <div className="rating-item">
              <span className="rating-label">評分次數</span>
              <span className="rating-value">{profile.ratingCount ?? 0} 次</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="btn btn-primary">
                編輯個人資料
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  onClick={handleSave} 
                  className="btn btn-success"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? '儲存中...' : '儲存'}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="btn btn-secondary"
                  disabled={updateUserMutation.isPending}
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {!isEditing ? (
            // 顯示模式
            <div className="profile-display">
              <div className="profile-section">
                <h2 className="section-title">基本資訊</h2>
                <div className="info-grid">
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
                </div>
              </div>
            </div>
          ) : (
            // 編輯模式
            <div className="profile-edit">
              <div className="profile-section">
                <h2 className="section-title">基本資訊</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      使用者名稱
                    </label>
                    <input
                      type="text"
                      value={editedProfile.username}
                      disabled
                      className="form-input disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      disabled
                      className="form-input disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      暱稱 <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={editedProfile.nickname}
                      onChange={(e) => handleChange('nickname', e.target.value)}
                      placeholder="請輸入暱稱"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      電話（09開頭10碼）
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="0912345678"
                      className="form-input"
                      maxLength={10}
                    />
                    {editedProfile.phoneNumber && editedProfile.phoneNumber.length > 0 && (
                      <div className="validation-hint">
                        {editedProfile.phoneNumber.length !== 10 && (
                          <span className="error">目前 {editedProfile.phoneNumber.length} 位，需要 10 位數字</span>
                        )}
                        {editedProfile.phoneNumber.length >= 2 && !editedProfile.phoneNumber.startsWith('09') && (
                          <span className="error">電話號碼必須以 09 開頭</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">地址</label>
                    <input
                      type="text"
                      value={editedProfile.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="例：台北市"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

