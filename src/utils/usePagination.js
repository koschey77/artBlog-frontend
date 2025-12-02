import {useState} from 'react'

const usePagination = (initialPageSize = 6) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [paginationData, setPaginationData] = useState(null)

  // Обработать ответ API с пагинацией
  const handlePaginationResponse = (response) => {
    setPaginationData({
      count: response.count,
      next: response.next,
      previous: response.previous,
      results: response.results,
      totalPages: Math.ceil(response.count / pageSize),
    })
    return response.results
  }

  // Сбросить на первую страницу
  const resetToFirstPage = () => {
    setCurrentPage(1)
  }

  // Изменить размер страницы
  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Сбросить на первую страницу при изменении размера
  }

  // Генерация URL с параметрами пагинации
  const getPaginationParams = () => {
    return {
      page: currentPage,
      page_size: pageSize,
    }
  }

  // Построить массив номеров страниц для отображения
  const getPageNumbers = () => {
    if (!paginationData) return []

    const totalPages = paginationData.totalPages
    const pages = []

    // Показываем максимум 15 страниц одновременно
    let startPage = 1
    let endPage = totalPages

    // Корректируем начальную страницу, если нужно
    if (endPage - startPage < 14) {
      startPage = Math.max(1, endPage - 14)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return {
    // State
    currentPage,
    pageSize,
    paginationData,

    // Actions
    setCurrentPage,
    changePageSize,
    resetToFirstPage,
    handlePaginationResponse,

    // Helpers
    getPaginationParams,
    getPageNumbers,

    // Computed values
    totalPages: paginationData?.totalPages || 0,
    totalItems: paginationData?.count || 0,
    hasNext: !!paginationData?.next,
    hasPrevious: !!paginationData?.previous,
    items: paginationData?.results || [],
  }
}

export default usePagination
