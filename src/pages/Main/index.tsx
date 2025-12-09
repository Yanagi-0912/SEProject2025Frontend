import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Filter from './Filter'
import Header from './Header'
import Products from './Products'
import Pagination from './Pagination'

function Main() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const total = 10

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF0F5' }}>
      <Header />

      <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ width: '280px', flexShrink: 0 }}>
          <Filter />
        </div>
        <div style={{ flex: 1 }}>
          <Products
            page={page}
            onProductClick={(p: { id?: string | number; productID?: string | number }) => {
              const id = p.id ?? p.productID ?? null
              if (id) navigate(`/product/${id}`)
            }}
          />
          <Pagination page={page} total={total} setPage={setPage} />
        </div>
      </div>
    </div>
  )
}

export default Main