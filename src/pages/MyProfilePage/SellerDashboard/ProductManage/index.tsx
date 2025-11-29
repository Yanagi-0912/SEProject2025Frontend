import { useState } from 'react';
import axios from 'axios';
import type { Product } from '../../../../api/generated';
import { useCreateProduct } from '../../../../api/generated';
import './ProductManage.css';

interface ProductManageProps {
  viewMode: 'list' | 'create' | 'edit';
  searchQuery: string;
  onModeChange: (mode: 'list' | 'create' | 'edit') => void;
}


const ProductManage = ({ viewMode, searchQuery, onModeChange }: ProductManageProps) => {
  const createProductMutation = useCreateProduct();
  
  // TODO: 使用實際的 API 獲取賣家的商品列表
  // const { data: userData } = useGetCurrentUser();
  // const sellerId = userData?.data?.id;

  // TODO: 使用實際的 API 獲取商品
  const [products] = useState<Product[]>([
    {
        productID: '無效的商品ID',
	    sellerID: '無效的賣家ID',
	    productName: '無效的商品名稱',
	    productDescription: '無效的商品描述',
	    productPrice: 404,
	    productImage: `https://picsum.photos/300/300?random=100`,
	    productType: 'DIRECT',
	    productCategory: '{資料遺失}',
	    productStatus: 'ACTIVE',
	    createdTime: '{資料遺失}',
	    updatedTime: '{資料遺失}',
        productStock: 404,
	    auctionEndTime: '{資料遺失}',
	    nowHighestBid: 404,
	    highestBidderID: '無效的出價者ID',
	    viewCount: 404,
	    averageRating: 4.04,
	    reviewCount: 404,
	    totalSales: 404,
    },
  ]);

  // 商品表單狀態 - 使用完整的 Product 結構
  const [newProduct, setNewProduct] = useState<Product>({
    productName: '',
    productPrice: 0,
    productStock: 0,
    productType: 'DIRECT',
    productDescription: '',
    productImage: '',
    productCategory: '',
    productStatus: 'ACTIVE',
    auctionEndTime: '',
    nowHighestBid: 0,
  });

  // 編輯中的商品
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 過濾商品
  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 簡單前端驗證
    if (!newProduct.productName || newProduct.productName.trim() === '') {
      alert('請輸入商品名稱');
      return;
    }

    if (newProduct.productType === 'AUCTION' && (!newProduct.auctionEndTime || newProduct.auctionEndTime === '')) {
      alert('競標商品請設定競標結束時間');
      return;
    }

    // 印出實際要送的 payload，方便除錯後端回傳 400 的原因
    console.debug('Create product payload:', newProduct);

    try {
      await createProductMutation.mutateAsync({
        data: newProduct
      });

      alert('商品創建成功！');
      
      // 重置表單
      setNewProduct({
        productName: '',
        productPrice: 0,
        productStock: 0,
        productType: 'DIRECT',
        productDescription: '',
        productImage: '',
        productCategory: '',
        productStatus: 'ACTIVE',
        auctionEndTime: '',
        nowHighestBid: 0,
      });
      
      onModeChange('list');
    } catch (error: unknown) {
      console.error('創建商品失敗:', error);
      // 嘗試顯示後端回傳的錯誤內容（若為 axios 錯誤）
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response status:', error.response.status);
        console.error('Server response data:', error.response.data);
        alert(`創建商品失敗：${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else {
        alert('創建商品失敗，請稍後再試');
      }
    }
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // TODO: 調用 API 更新商品
    console.log('更新商品:', editingProduct);
    alert('商品更新功能開發中...');
    setEditingProduct(null);
    onModeChange('list');
  };

  const handleEditInputChange = (field: keyof Product, value: string | number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: value
    });
  };

  const handleEdit = (productId: string) => {
    const product = products.find(p => p.productID === productId);
    if (product) {
      setEditingProduct(product);
      onModeChange('edit');
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm('確定要刪除此商品嗎？')) {
      console.log('刪除商品:', productId);
      alert('刪除功能開發中...');
    }
  };

  // 編輯商品表單
  if (viewMode === 'edit' && editingProduct) {
    return (
      <div className="product-manage-card">
        <h2 className="manage-title">編輯商品</h2>
        
        <form onSubmit={handleUpdateProduct} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">商品名稱 *</label>
              <input
                type="text"
                value={editingProduct.productName || ''}
                onChange={(e) => handleEditInputChange('productName', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">商品類型 *</label>
              <select
                value={editingProduct.productType || 'DIRECT'}
                onChange={(e) => handleEditInputChange('productType', e.target.value)}
                className="form-input"
              >
                <option value="DIRECT">直購</option>
                <option value="AUCTION">競標</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">價格 *</label>
              <input
                type="number"
                value={editingProduct.productPrice || 0}
                onChange={(e) => handleEditInputChange('productPrice', Number(e.target.value))}
                className="form-input"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">庫存 *</label>
              <input
                type="number"
                value={editingProduct.productStock || 0}
                onChange={(e) => handleEditInputChange('productStock', Number(e.target.value))}
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">商品分類</label>
            <input
              type="text"
              value={editingProduct.productCategory || ''}
              onChange={(e) => handleEditInputChange('productCategory', e.target.value)}
              className="form-input"
              placeholder="例：電子產品"
            />
          </div>

          <div className="form-group">
            <label className="form-label">圖片網址</label>
            <input
              type="url"
              value={editingProduct.productImage || ''}
              onChange={(e) => handleEditInputChange('productImage', e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
            {editingProduct.productImage && (
              <div className="image-preview">
                <img src={editingProduct.productImage} alt="預覽" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">商品描述</label>
            <textarea
              value={editingProduct.productDescription || ''}
              onChange={(e) => handleEditInputChange('productDescription', e.target.value)}
              className="form-textarea"
              rows={5}
              placeholder="請輸入商品詳細描述..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="form-btn submit-btn">
              更新商品
            </button>
            <button 
              type="button" 
              onClick={() => {
                setEditingProduct(null);
                onModeChange('list');
              }}
              className="form-btn cancel-btn"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 新增商品表單
  if (viewMode === 'create') {
    return (
      <div className="product-manage-card">
        <h2 className="manage-title">建立新商品</h2>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">商品名稱 *</label>
              <input
                type="text"
                value={newProduct.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">商品類型 *</label>
              <select
                value={newProduct.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="form-input"
              >
                <option value="DIRECT">直購</option>
                <option value="AUCTION">競標</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">價格 *</label>
              <input
                type="number"
                value={newProduct.productPrice}
                onChange={(e) => handleInputChange('productPrice', Number(e.target.value))}
                className="form-input"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">庫存 *</label>
              <input
                type="number"
                value={newProduct.productStock}
                onChange={(e) => handleInputChange('productStock', Number(e.target.value))}
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">商品分類</label>
            <input
              type="text"
              value={newProduct.productCategory}
              onChange={(e) => handleInputChange('productCategory', e.target.value)}
              className="form-input"
              placeholder="例：電子產品"
            />
          </div>

          <div className="form-group">
            <label className="form-label">商品狀態 *</label>
            <select
              value={newProduct.productStatus}
              onChange={(e) => handleInputChange('productStatus', e.target.value)}
              className="form-input"
            >
              <option value="ACTIVE">上架</option>
              <option value="INACTIVE">下架</option>
            </select>
          </div>

          {newProduct.productType === 'AUCTION' && (
            <div className="form-group">
              <label className="form-label">競標結束時間 {newProduct.productType === 'AUCTION' ? '*' : ''}</label>
              <input
                type="datetime-local"
                value={newProduct.auctionEndTime}
                onChange={(e) => handleInputChange('auctionEndTime', e.target.value)}
                className="form-input"
                required={newProduct.productType === 'AUCTION'}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">圖片網址</label>
            <input
              type="url"
              value={newProduct.productImage}
              onChange={(e) => handleInputChange('productImage', e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
            {newProduct.productImage && (
              <div className="image-preview">
                <img src={newProduct.productImage} alt="預覽" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">商品描述</label>
            <textarea
              value={newProduct.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              className="form-textarea"
              rows={5}
              placeholder="請輸入商品詳細描述..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="form-btn submit-btn"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? '創建中...' : '創建商品'}
            </button>
            <button 
              type="button" 
              onClick={() => onModeChange('list')}
              className="form-btn cancel-btn"
              disabled={createProductMutation.isPending}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="product-manage-card">
      <h2 className="manage-title">
        商品清單 
        {searchQuery && <span className="search-result">（搜尋: {searchQuery}）</span>}
      </h2>
      
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📦</p>
          <p className="empty-text">
            {searchQuery ? '找不到符合的商品' : '尚無商品，點擊「建立新商品」開始上架'}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.productID} className="product-card">
              <div className="product-image">
                {product.productImage ? (
                  <img src={product.productImage} alt={product.productName} />
                ) : (
                  <div className="image-placeholder" aria-hidden>沒有圖片</div>
                )}
                <span className={`product-badge ${product.productType?.toLowerCase()}`}>
                  {product.productType === 'DIRECT' ? '直購' : '競標'}
                </span>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-price">${product.productPrice}</p>
                <p className="product-stock">庫存: {product.productStock}</p>
                <span className={`status-badge ${product.productStatus?.toLowerCase()}`}>
                  {product.productStatus === 'ACTIVE' ? '上架中' : '未上架'}
                </span>
              </div>

              <div className="product-actions">
                <button 
                  onClick={() => handleEdit(product.productID ?? '')}
                  className="action-btn edit-btn"
                >
                  編輯
                </button>
                <button 
                  onClick={() => handleDelete(product.productID ?? '')}
                  className="action-btn delete-btn"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManage;
