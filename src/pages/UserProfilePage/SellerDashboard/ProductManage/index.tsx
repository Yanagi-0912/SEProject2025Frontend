import { useState } from 'react';
import type { Product } from '../../../../api/generated';
import './ProductManage.css';

interface ProductManageProps {
  viewMode: 'list' | 'create' | 'edit';
  searchQuery: string;
  onModeChange: (mode: 'list' | 'create' | 'edit') => void;
}

const ProductManage = ({ viewMode, searchQuery, onModeChange }: ProductManageProps) => {
  // TODO: 使用實際的 API 獲取賣家的商品列表
  // const { data: userData } = useGetCurrentUser();
  // const sellerId = userData?.data?.id;
/*
const SAMPLE_PRODUCT: ProductProps = {
	productID: '無效的商品ID',
	sellerID: '無效的賣家ID',
	productName: '無效的商品名稱',
	productDescription: '無效的商品描述',
	productPrice: 404,
	productImage: `https://picsum.photos/300/300?random=100`,
	productType: 'INACTIVE',
	productStock: 404,
	productCategory: '{資料遺失}',
	productStatus: 'ACTIVE',
	createdTime: '{資料遺失}',
	updatedTime: '{資料遺失}',
	auctionEndTime: '{資料遺失}',
	nowHighestBid: 404,
	highestBidderID: '無效的出價者ID',
	viewCount: 404,
	averageRating: 4.04,
	reviewCount: 404,
	totalSales: 404,
};*/
  // TODO: 使用實際的 API 獲取商品
  const [products] = useState<Product[]>([
    {
      productID: '1',
      productName: '範例商品 1',
      productPrice: 1000,
      productStock: 10,
      productStatus: 'ACTIVE',
      productType: 'DIRECT',
      productImage: 'https://picsum.photos/200/200?random=1',
      productDescription: '這是範例商品描述',
    },
    {
      productID: '2',
      productName: '範例商品 2',
      productPrice: 2000,
      productStock: 5,
      productStatus: 'ACTIVE',
      productType: 'AUCTION',
      productImage: 'https://picsum.photos/200/200?random=2',
      productDescription: '這是範例商品描述',
    },
  ]);

  // 商品表單狀態
  const [newProduct, setNewProduct] = useState({
    productName: '',
    productPrice: 0,
    productStock: 0,
    productType: 'DIRECT' as const,
    productDescription: '',
    productImage: '',
    productCategory: '',
  });

  // 編輯中的商品
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 過濾商品
  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (field: string, value: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 調用 API 創建商品
    console.log('創建商品:', newProduct);
    alert('商品創建功能開發中...');
    setNewProduct({
      productName: '',
      productPrice: 0,
      productStock: 0,
      productType: 'DIRECT',
      productDescription: '',
      productImage: '',
      productCategory: '',
    });
    onModeChange('list');
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

  const handleEditInputChange = (field: string, value: string | number) => {
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
            <button type="submit" className="form-btn submit-btn">
              創建商品
            </button>
            <button 
              type="button" 
              onClick={() => onModeChange('list')}
              className="form-btn cancel-btn"
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
                <img src={product.productImage} alt={product.productName} />
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
