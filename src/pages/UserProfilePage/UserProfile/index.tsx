import { useState } from 'react';
import { useUpdateUser } from '../../../api/generated';

interface UserProps {
  id: string;               // 使用者ID
  username: string;         // 使用者名稱
  email?: string;           // 使用者電子郵件
  nickname: string;         // 使用者暱稱
  phoneNumber?: string;     // 使用者電話
  address?: string;         // 使用者地址
  averageRating?: number;   // 使用者平均評分
  ratingCount?: number;     // 使用者評分數量
  onUpdateSuccess?: () => void; // 更新成功的回調
  readOnly?: boolean;       // 是否為只讀模式
}

function UserProfile(profile: UserProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProps>(profile);
  const updateUserMutation = useUpdateUser();
  
  // 只讀模式不允許編輯
  const canEdit = !profile.readOnly;

  const handleEdit = () => {
    if (!canEdit) return;
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
    <div>
      {/* 用戶頭像和基本資訊 */}
      <div>
        {profile?.nickname?.charAt?.(0)?.toUpperCase() ?? '?'}
      </div>
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
      {canEdit && !isEditing ? (
        <button onClick={handleEdit}>
          編輯個人資料
        </button>
      ) : canEdit && isEditing ? (
        <>
          <button 
            onClick={handleSave} 
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? '儲存中...' : '儲存'}
          </button>
          <button 
            onClick={handleCancel} 
            disabled={updateUserMutation.isPending}
          >
            取消
          </button>
        </>
      ) : null}

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
        <>
          <div>
            <label>使用者名稱</label>
            <input
              type="text"
              value={editedProfile.username}
              disabled
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={editedProfile.email}
              disabled
            />
          </div>

          <div>
            <label>暱稱 <span>*</span></label>
            <input
              type="text"
              value={editedProfile.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="請輸入暱稱"
            />
          </div>

          <div>
            <label>電話（09開頭10碼）</label>
            <input
              type="tel"
              value={editedProfile.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="0912345678"
              maxLength={10}
            />
            {editedProfile.phoneNumber && editedProfile.phoneNumber.length > 0 && (
              <div>
                {editedProfile.phoneNumber.length !== 10 && (
                  <span>目前 {editedProfile.phoneNumber.length} 位，需要 10 位數字</span>
                )}
                {editedProfile.phoneNumber.length >= 2 && !editedProfile.phoneNumber.startsWith('09') && (
                  <span>電話號碼必須以 09 開頭</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label>地址</label>
            <input
              type="text"
              value={editedProfile.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="例：台北市"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;

