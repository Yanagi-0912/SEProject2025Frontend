function Filter() {
  return (
    <div>
      <h3>調參數</h3>
      <div>
        <label>價格範圍</label>
        <input type="number" placeholder="最低價" />
        <input type="number" placeholder="最高價" />
      </div>
      <div>
        <label htmlFor="category">分類</label>
        <select id="category">
          <option>全部</option>
          <option>電子產品</option>
          <option>服飾</option>
          <option>書籍</option>
        </select>
      </div>
      <div>
        <label htmlFor="sort">排序</label>
        <select id="sort">
          <option>價格低到高</option>
          <option>價格高到低</option>
          <option>最新上架</option>
        </select>
      </div>
    </div>
  )
}

export default Filter

