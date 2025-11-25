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
    <div style={{ border: '2px solid yellowgreen', backgroundColor: 'rgb(62, 64, 68)', color: 'white'}}>
      <Header />

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 1, backgroundColor: 'white'}}>
          <Filter />
        </div>
        <div style={{ flex: 5 }}>
          <Products
            page={page}
            onProductClick={(p: { id?: string | number; productID?: string | number }) => {
              const id = p.id ?? p.productID ?? null
              if (id) navigate(`/product/${id}`)
            }}
          />
        </div>
      </div>

      <Pagination page={page} total={total} setPage={setPage} />
    </div>
  )
}

export default Main