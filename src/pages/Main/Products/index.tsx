interface ProductsProps {
  page: number;
}

function Products({ page }: ProductsProps) {
  // 根據頁碼顯示不同商品
  const products = [];
  for (let i = 0; i < 12; i++) {
    const id = (page - 1) * 12 + i + 1;
    products.push({
      id,
      name: `商品 ${id}`,
      price: id // 第一個商品就是一塊，第二個2塊，以此類推
    });
  }

  return (
    <div style={{ border: '2px solid orange' }}>
      <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
        {products.map(product => (
          <div key={product.id}
          style={{
            flex: '1 0 calc(25% - 16px)', // 每排4個
            border: '1px solid white',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}>
            <h4>{product.name}</h4>
            <p>價格: ${product.price}</p>
            <button>加入購物車</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products

