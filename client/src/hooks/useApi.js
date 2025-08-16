import { useState, useEffect } from 'react'

// Custom hook for API calls with loading states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

// Hook for pagination
export const usePagination = (initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  const updatePagination = (meta) => {
    if (meta) {
      setTotalPages(meta.pages || 1)
      setTotalItems(meta.total || 0)
    }
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    updatePagination,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}