interface PaginationProps {
  page: number;
  total: number;
  setPage: (page: number) => void;
}

function Pagination({ page, total, setPage }: PaginationProps) {
  const prev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const next = () => {
    if (page < total) {
      setPage(page + 1);
    }
  };

  const getPages = () => {
    const p: number[] = [];
    
    if (page === 1) {
      p.push(1, 2, 3);
    } else if (page === total) {
      p.push(total - 2, total - 1, total);
    } else {
      p.push(page - 1, page, page + 1);
    }
    
    return p;
  };

  return (
    <div style={{ 
      border: '2px solid blue', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
      <button onClick={prev} disabled={page === 1}>
        ←
      </button>

      <button onClick={() => setPage(getPages()[0])} disabled={page === getPages()[0]}>
        {getPages()[0]}
      </button>
      <button onClick={() => setPage(getPages()[1])} disabled={page === getPages()[1]}>
        {getPages()[1]}
      </button>
      <button onClick={() => setPage(getPages()[2])} disabled={page === getPages()[2]}>
        {getPages()[2]}
      </button>

      <button onClick={next} disabled={page === total}>
        →
      </button>
    </div>
  );
}

export default Pagination

