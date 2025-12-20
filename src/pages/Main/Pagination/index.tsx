import './Pagination.css';
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
    if (total <= 0) {
      return [];
    }

    // 如果總頁數 <= 10，顯示所有頁碼
    if (total <= 10) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // 如果總頁數 > 10，顯示當前頁附近的頁碼，加上首頁和末頁
    const p: number[] = [];
    
    // 總是顯示第一頁
    p.push(1);

    // 計算當前頁附近的頁碼範圍
    let start = Math.max(2, page - 1);
    let end = Math.min(total - 1, page + 1);

    // 如果當前頁靠近開頭，顯示更多後面的頁碼
    if (page <= 3) {
      end = Math.min(total - 1, 5);
    }
    // 如果當前頁靠近結尾，顯示更多前面的頁碼
    else if (page >= total - 2) {
      start = Math.max(2, total - 4);
    }

    // 如果 start > 2，表示需要省略號
    if (start > 2) {
      p.push(-1); // -1 表示省略號
    }

    // 添加當前頁附近的頁碼
    for (let i = start; i <= end; i++) {
      p.push(i);
    }

    // 如果 end < total - 1，表示需要省略號
    if (end < total - 1) {
      p.push(-2); // -2 表示省略號
    }

    // 總是顯示最後一頁
    if (total > 1) {
      p.push(total);
    }

    return p;
  };

  const pages = getPages();

  // 如果沒有頁面，不顯示分頁
  if (total <= 0) {
    return null;
  }

  return (
    <div className="pagination-container" >
      <button onClick={prev} disabled={page === 1 || total === 0} className="pagination-btn">
        ←
      </button>

      {pages.map((pageNum, index) => {
        // -1 和 -2 表示省略號
        if (pageNum === -1 || pageNum === -2) {
          return (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          );
        }
        
        return (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            disabled={page === pageNum}
            className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        );
      })}

      <button onClick={next} disabled={page === total || total === 0} className="pagination-btn">
        →
      </button>
    </div>
  );
}

export default Pagination

