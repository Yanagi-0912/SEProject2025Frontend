import { useState, useEffect } from 'react'
import './BuyerInfo.css'

interface BuyerData {
  name: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
}

function BuyerInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [buyerInfo, setBuyerInfo] = useState<BuyerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    // 從 localStorage 載入登入資訊（不可編輯）
    const username = localStorage.getItem('username') || ''
    const email = localStorage.getItem('email') || ''
    
    // 從 localStorage 載入買家資訊
    const savedInfo = localStorage.getItem('buyerInfo')
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo)
      setBuyerInfo({
        ...parsed,
        name: username, // 強制使用登入的 username
        email: email    // 強制使用註冊的 email
      })
    } else {
      // 如果沒有保存的資訊，至少填入 username 和 email
      setBuyerInfo(prev => ({
        ...prev,
        name: username,
        email: email
      }))
    }
  }, [])

  const handleSave = () => {
    // 驗證必填欄位
    if (!buyerInfo.phone) {
      alert('請填寫電話')
      return
    }

    // 驗證電話號碼格式（必須是10位數字且前兩碼是09）
    const phoneRegex = /^09[0-9]{8}$/
    if (!phoneRegex.test(buyerInfo.phone)) {
      alert('電話號碼必須是10位數字且前兩碼為09')
      return
    }

    // 確保姓名和 Email 使用登入資訊
    const username = localStorage.getItem('username') || ''
    const email = localStorage.getItem('email') || ''
    
    const dataToSave = {
      ...buyerInfo,
      name: username,
      email: email
    }

    // 儲存到 localStorage
    localStorage.setItem('buyerInfo', JSON.stringify(dataToSave))
    setBuyerInfo(dataToSave)
    setIsEditing(false)
  }

  const handleChange = (field: keyof BuyerData, value: string) => {
    // 如果是電話欄位，只允許數字且最多10位
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '') // 只保留數字
      if (digitsOnly.length <= 10) {
        setBuyerInfo(prev => ({
          ...prev,
          [field]: digitsOnly
        }))
      }
    } else {
      setBuyerInfo(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <div className="buyer-info-container">
      <div className="buyer-info-header">
        <h2 className="buyer-info-title">📋 買家基本資訊</h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="buyer-info-button buyer-info-button-primary"
          >
            編輯資訊
          </button>
        ) : (
          <div className="buyer-info-button-group">
            <button 
              onClick={handleSave}
              className="buyer-info-button buyer-info-button-primary"
            >
              儲存
            </button>
            <button 
              onClick={() => {
                setIsEditing(false)
                // 重新載入資料
                const username = localStorage.getItem('username') || ''
                const email = localStorage.getItem('email') || ''
                const savedInfo = localStorage.getItem('buyerInfo')
                if (savedInfo) {
                  const parsed = JSON.parse(savedInfo)
                  setBuyerInfo({
                    ...parsed,
                    name: username,
                    email: email
                  })
                } else {
                  setBuyerInfo({
                    name: username,
                    email: email,
                    phone: '',
                    address: '',
                    city: '',
                    postalCode: ''
                  })
                }
              }}
              className="buyer-info-button buyer-info-button-secondary"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        // 顯示模式
        <div className="buyer-info-display">
          {buyerInfo.name ? (
            <>
              <p><strong>姓名：</strong>{buyerInfo.name}</p>
              <p><strong>電話：</strong>{buyerInfo.phone}</p>
              <p><strong>Email：</strong>{buyerInfo.email || '未填寫'}</p>
              <p><strong>城市：</strong>{buyerInfo.city || '未填寫'}</p>
              <p><strong>郵遞區號：</strong>{buyerInfo.postalCode || '未填寫'}</p>
              <p><strong>地址：</strong>{buyerInfo.address || '未填寫'}</p>
            </>
          ) : (
            <p className="buyer-info-empty">尚未填寫買家資訊，請點擊「編輯資訊」開始填寫</p>
          )}
        </div>
      ) : (
        // 編輯模式
        <div className="buyer-info-form">
          <div className="buyer-info-field">
            <label className="buyer-info-label">
              姓名（登入帳號）
            </label>
            <input
              type="text"
              value={buyerInfo.name}
              className="buyer-info-input buyer-info-input-disabled"
              disabled
              placeholder="自動從登入資訊獲取"
            />
          </div>

          <div className="buyer-info-field">
            <label className="buyer-info-label">
              Email（註冊信箱）
            </label>
            <input
              type="email"
              value={buyerInfo.email}
              className="buyer-info-input buyer-info-input-disabled"
              disabled
              placeholder="自動從註冊資訊獲取"
            />
          </div>

          <div className="buyer-info-field">
            <label className="buyer-info-label">
              電話（09開頭10碼）<span className="buyer-info-required">*</span>
            </label>
            <input
              type="tel"
              value={buyerInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="請輸入手機號碼，例：0912345678"
              className="buyer-info-input"
              maxLength={10}
            />
            {buyerInfo.phone && (
              <>
                {buyerInfo.phone.length !== 10 && (
                  <span className="buyer-info-validation-hint">
                    目前 {buyerInfo.phone.length} 位，需要 10 位數字
                  </span>
                )}
                {buyerInfo.phone.length >= 2 && !buyerInfo.phone.startsWith('09') && (
                  <span className="buyer-info-validation-hint">
                    電話號碼必須以 09 開頭
                  </span>
                )}
              </>
            )}
          </div>

          <div className="buyer-info-row">
            <div className="buyer-info-col">
              <label className="buyer-info-label">
                城市
              </label>
              <input
                type="text"
                value={buyerInfo.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="例：台北市"
                className="buyer-info-input"
              />
            </div>

            <div className="buyer-info-col">
              <label className="buyer-info-label">
                郵遞區號
              </label>
              <input
                type="text"
                value={buyerInfo.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="例：100"
                className="buyer-info-input"
              />
            </div>
          </div>

          <div className="buyer-info-field">
            <label className="buyer-info-label">
              地址
            </label>
            <textarea
              value={buyerInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="請輸入詳細地址"
              rows={3}
              className="buyer-info-textarea"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerInfo

