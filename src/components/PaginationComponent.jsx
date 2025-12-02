import React from 'react'

const PaginationComponent = ({
  pagination,
  showPageSizeSelector = true,
  pageSizeOptions = [6, 12, 24, 48, 96],
  className = 'd-flex mt-5 justify-content-center',
}) => {
  if (!pagination.paginationData) return null

  return (
    <div className="pagination-wrapper">
      {/* Показать информацию о текущих результатах */}
      {pagination.totalItems > 0 && (
        <div className="row mt-3">
          <div className="col">
            <div className="text-center text-muted">
              <small>
                Show {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} from {pagination.totalItems}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Селектор размера страницы */}
      {showPageSizeSelector && (
        <div className="row mt-2">
          <div className="col d-flex justify-content-center">
            <div className="d-flex align-items-center">
              <span className="me-2">Show</span>

              <select
                className="form-select"
                style={{width: 'auto'}}
                value={pagination.pageSize}
                onChange={(e) => pagination.changePageSize(parseInt(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="ms-2">items per page</span>
            </div>
          </div>
        </div>
      )}

      {/* Навигация по страницам */}
      <nav className={className}>
        <ul className="pagination">
          <li className={`page-item ${!pagination.hasPrevious ? 'disabled' : ''}`}>
            <button
              className="page-link me-1"
              onClick={() => pagination.setCurrentPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
            >
              <i className="ci-arrow-left me-2" />
              Previous
            </button>
          </li>
        </ul>
        <ul className="pagination">
          {pagination.getPageNumbers().map((number) => (
            <li key={number} className={`page-item ${pagination.currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => pagination.setCurrentPage(number)}>
                {number}
              </button>
            </li>
          ))}
        </ul>

        <ul className="pagination">
          <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
            <button className="page-link ms-1" onClick={() => pagination.setCurrentPage(pagination.currentPage + 1)} disabled={!pagination.hasNext}>
              Next
              <i className="ci-arrow-right ms-3" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default PaginationComponent
