import './Products.css'

interface ProductsProps {
  page: number;
  onProductClick?: () => void;
}

function Products({ page, onProductClick }: ProductsProps) {
  // 根據頁碼顯示不同商品
  const products = [];
  for (let i = 0; i < 12; i++) {
    const id = (page - 1) * 12 + i + 1;
    products.push({
      id,
      name: `商品 ${id}`,
      price: id, // 第一個商品就是一塊，第二個2塊，以此類推
      image: `https://picsum.photos/300/300?random=${id}` // 使用 Lorem Picsum 提供隨機圖片
    });
  }

  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="products-card">
            <img 
              src={product.image} 
              alt={product.name} 
              className="products-card-image"
              onClick={onProductClick}
            />
            <h4>{product.name}</h4>
            <p>價格: ${product.price}</p>
            <button className="add-to-cart-button">加入購物車</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products

