import { useState } from 'react';
import axios from 'axios';
import type { Product } from '../../../../api/generated';
import { useCreateProduct, useDeleteProduct, useEditProduct, useUploadImage } from '../../../../api/generated';
import './index.css';

interface ProductManageProps {
  viewMode: 'list' | 'create' | 'edit';
  searchQuery: string;
  productList: Product[];
  onModeChange: (mode: 'list' | 'create' | 'edit') => void;
}


const ProductManage = ({ viewMode, searchQuery, productList, onModeChange }: ProductManageProps) => {
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();
  const editProductMutation = useEditProduct();
  const uploadImageMutation = useUploadImage();

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
  const filteredProducts = productList.filter(product =>
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
    
    // 檢查 token
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (!token) {
      alert('未登入或登入已過期，請重新登入');
      return;
    }
    
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
      console.log('About to call createProductMutation with:', newProduct);
      await createProductMutation.mutateAsync({
        data: newProduct
      });
      console.log('createProductMutation succeeded');
      
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

  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resp = await uploadImageMutation.mutateAsync({
        data: { file }
      });
      // resp 是 AxiosResponse<string> 但實際上返回的是 JSON {url: '...'}
      // 取得 data 屬性並嘗試解析
      const responseData = resp.data;
      console.log('Response data:', responseData);
      
      let imageUrl = '';
      // 伺服器回傳的是 {url: '...'} 的 JSON，但被當成 string
      if (typeof responseData === 'string') {
        // 嘗試解析為 JSON
        try {
          const parsed = JSON.parse(responseData) as { url: string };
          imageUrl = parsed.url || '';
        } catch {
          // 如果不是 JSON，直接使用
          imageUrl = responseData;
        }
      } else if (typeof responseData === 'object' && responseData !== null) {
        imageUrl = (responseData as Record<string, unknown>).url as string || '';
      }
      
      console.log('Image URL extracted:', imageUrl);
      if (imageUrl) {
        setNewProduct(prev => ({ ...prev, productImage: imageUrl }));
        console.log('圖片已更新:', imageUrl);
      } else {
        console.warn('未能提取到圖片 URL');
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          alert('檔案太大，請選擇較小的圖片');
        } else if (error.response?.status === 500) {
          alert('伺服器錯誤，圖片上傳失敗，請聯絡管理員');
        } else {
          alert('圖片上傳失敗，請稍後再試');
        }
      } else {
        alert('圖片上傳失敗，請稍後再試');
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.productID) {
      alert('商品資訊無效');
      return;
    }

    // 前端驗證
    if (!editingProduct.productName || editingProduct.productName.trim() === '') {
      alert('請輸入商品名稱');
      return;
    }

    if (editingProduct.productType === 'AUCTION' && (!editingProduct.auctionEndTime || editingProduct.auctionEndTime === '')) {
      alert('競標商品請設定競標結束時間');
      return;
    }

    console.debug('Update product payload:', editingProduct);

    try {
      await editProductMutation.mutateAsync({
        productID: editingProduct.productID,
        data: editingProduct
      });

      alert('商品更新成功！');
      setEditingProduct(null);
      onModeChange('list');
      // 可以在這裡重新查詢商品清單或重整頁面
      window.location.reload();
    } catch (error: unknown) {
      console.error('更新商品失敗:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response status:', error.response.status);
        console.error('Server response data:', error.response.data);
        alert(`更新商品失敗：${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else {
        alert('更新商品失敗，請稍後再試');
      }
    }
  };

  const handleUploadEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      const resp = await uploadImageMutation.mutateAsync({
        data: { file }
      });
      // resp 是 AxiosResponse<string> 但實際上返回的是 JSON {url: '...'}
      // 取得 data 屬性並嘗試解析
      const responseData = resp.data;
      console.log('Response data:', responseData);
      
      let imageUrl = '';
      // 伺服器回傳的是 {url: '...'} 的 JSON，但被當成 string
      if (typeof responseData === 'string') {
        // 嘗試解析為 JSON
        try {
          const parsed = JSON.parse(responseData) as { url: string };
          imageUrl = parsed.url || '';
        } catch {
          // 如果不是 JSON，直接使用
          imageUrl = responseData;
        }
      } else if (typeof responseData === 'object' && responseData !== null) {
        imageUrl = (responseData as Record<string, unknown>).url as string || '';
      }
      
      console.log('Image URL extracted:', imageUrl);
      if (imageUrl) {
        setEditingProduct(prev => (prev ? { ...prev, productImage: imageUrl } : prev));
        console.log('圖片已更新:', imageUrl);
      } else {
        console.warn('未能提取到圖片 URL');
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          alert('檔案太大，請選擇較小的圖片');
        } else if (error.response?.status === 500) {
          alert('伺服器錯誤，圖片上傳失敗，請聯絡管理員');
        } else {
          alert('圖片上傳失敗，請稍後再試');
        }
      } else {
        alert('圖片上傳失敗，請稍後再試');
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleEditInputChange = (field: keyof Product, value: string | number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: value
    });
  };

  const handleEdit = (productId: string) => {
    const product = productList.find(p => p.productID === productId);
    if (product) {
      setEditingProduct(product);
      onModeChange('edit');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!productId) {
      alert('商品ID無效');
      return;
    }

    if (!confirm('確定要刪除此商品嗎？')) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync({
        productID: productId
      });
      alert('商品刪除成功！');
      // 可以在這裡重新查詢商品清單或重整頁面
      window.location.reload();
    } catch (error) {
      console.error('刪除商品失敗:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data);
        alert(`刪除商品失敗：${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else {
        alert('刪除商品失敗，請稍後再試');
      }
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
            <label className="form-label">商品狀態 *</label>
            <select
              value={editingProduct.productStatus || 'ACTIVE'}
              onChange={(e) => handleEditInputChange('productStatus', e.target.value)}
              className="form-input"
            >
              <option value="ACTIVE">上架</option>
              <option value="INACTIVE">下架</option>
              <option value="SOLD">已售出</option>
              <option value="BANNED">已禁用</option>
            </select>
          </div>

          {editingProduct.productType === 'AUCTION' && (
            <div className="form-group">
              <label className="form-label">競標結束時間 {editingProduct.productType === 'AUCTION' ? '*' : ''}</label>
              <input
                type="datetime-local"
                value={editingProduct.auctionEndTime || ''}
                onChange={(e) => handleEditInputChange('auctionEndTime', e.target.value)}
                className="form-input"
                required={editingProduct.productType === 'AUCTION'}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">圖片上傳</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadEditImage}
              className="form-input"
              disabled={uploadImageMutation.isPending}
            />
            {uploadImageMutation.isPending && (
              <div className="uploading-hint">上傳中...</div>
            )}
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
            <button 
              type="submit" 
              className="form-btn submit-btn"
              disabled={editProductMutation.isPending}
            >
              {editProductMutation.isPending ? '更新中...' : '更新商品'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setEditingProduct(null);
                onModeChange('list');
              }}
              className="form-btn cancel-btn"
              disabled={editProductMutation.isPending}
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
              <option value="SOLD">已售出</option>
              <option value="BANNED">已禁用</option>
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
            <label className="form-label">圖片上傳</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadNewImage}
              className="form-input"
              disabled={uploadImageMutation.isPending}
            />
            {uploadImageMutation.isPending && (
              <div className="uploading-hint">上傳中...</div>
            )}
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
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? '刪除中...' : '刪除'}
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
