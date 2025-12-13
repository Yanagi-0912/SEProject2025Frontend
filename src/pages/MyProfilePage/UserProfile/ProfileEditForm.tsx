import { useState } from 'react';
import { useUpdateUser } from '../../../api/generated';
import type { UserProps } from '../../UserProfilePage/types';

interface ProfileEditFormProps {
  profile: UserProps;
  onCancel: () => void;
  onSaveSuccess?: () => void;
}

function ProfileEditForm({ profile, onCancel, onSaveSuccess }: ProfileEditFormProps) {
  const [editedProfile, setEditedProfile] = useState<UserProps>(profile);
  const updateUserMutation = useUpdateUser();

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
      
      alert('個人資料已更新！');
      
      // 通知父組件重新獲取資料
      profile.onUpdateSuccess?.();
      
      // 關閉編輯模式
      onSaveSuccess?.();
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  return (
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

      <div>
        <button 
          onClick={handleSave} 
          disabled={updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? '儲存中...' : '儲存'}
        </button>
        <button 
          onClick={onCancel} 
          disabled={updateUserMutation.isPending}
        >
          取消
        </button>
      </div>
    </>
  );
}

export default ProfileEditForm;
