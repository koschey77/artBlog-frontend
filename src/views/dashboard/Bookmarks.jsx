import React, {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link} from 'react-router-dom'
import useAxios from '../../utils/useAxios'
import useUserData from '../../plugin/useUserData'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'
import moment from 'moment'
import Toast from '../../plugin/Toast'

function Bookmarks() {
  const axiosInstance = useAxios()
  const [bookmarks, setBookmarks] = useState([])
  const userId = useUserData()?.user_id

  // Пагинация для закладок
  const pagination = usePagination(6) // 6 закладок на странице для dashboard

  // Размеры страниц для dashboard
  const pageSizeOptions = [6, 12, 24, 48]

  const fetchBookmarks = async () => {
    const params = pagination.getPaginationParams()
    const response = await axiosInstance.get(`author/dashboard/bookmark-list/${userId}/`, {params})

    // Обработать ответ с пагинацией
    const bookmarksList = pagination.handlePaginationResponse(response.data)
    setBookmarks(bookmarksList)
  }

  useEffect(() => {
    fetchBookmarks()
  }, [pagination.currentPage, pagination.pageSize])

  // Helper function to get badge info based on post status
  const getStatusBadge = (post) => {
    if (!post.is_event) {
      return {
        text: 'Article',
        className: 'bg-primary',
      }
    }

    switch (post.event_status) {
      case 'upcoming':
        return {
          text: 'Upcoming Event',
          className: 'bg-warning text-dark',
        }
      case 'current':
        return {
          text: 'Current Event',
          className: 'bg-success',
        }
      case 'completed':
        return {
          text: 'Completed Event',
          className: 'bg-secondary',
        }
      default:
        return {
          text: 'Event',
          className: 'bg-info',
        }
    }
  }

  // Функция для удаления закладки
  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      // Находим пост для отправки данных
      const bookmark = bookmarks.find((b) => b.id === bookmarkId)
      if (!bookmark) return

      await axiosInstance.post('post/bookmark-post/', {
        user_id: userId,
        post_id: bookmark.post.id,
      })

      // Обновляем список закладок локально
      setBookmarks((prevBookmarks) => prevBookmarks.filter((b) => b.id !== bookmarkId))

      Toast('success', 'Bookmark removed successfully', '')
    } catch (error) {
      console.error('Error removing bookmark:', error)
      Toast('error', 'Failed to remove bookmark', '')
    }
  }

  return (
    <>
      <Header />
      <section className="py-4 mt-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border bg-transparent rounded-3">
                <div className="card-header bg-transparent border-bottom p-3">
                  <div className="d-sm-flex justify-content-between align-items-center">
                    <h5 className="mb-2 mb-sm-0">
                      My Bookmarks
                      {pagination.totalItems > 0 && <span className="badge bg-info bg-opacity-10 text-info">{pagination.totalItems}</span>}
                    </h5>
                    <Link to="/dashboard/" className="btn btn-sm btn-secondary mb-0">
                      <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {/* Bookmarks list table START */}
                  <div className="table-responsive border-0">
                    <table className="table align-middle p-4 mb-0 table-hover table-shrink">
                      {/* Table head */}
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" className="border-0 rounded-start">
                            Image
                          </th>
                          <th scope="col" className="border-0">
                            Article Name
                          </th>
                          <th scope="col" className="border-0">
                            Author
                          </th>
                          <th scope="col" className="border-0">
                            Views
                          </th>
                          <th scope="col" className="border-0">
                            Published Date
                          </th>
                          <th scope="col" className="border-0">
                            Bookmarked Date
                          </th>
                          <th scope="col" className="border-0">
                            Category
                          </th>
                          <th scope="col" className="border-0">
                            Type
                          </th>
                          <th scope="col" className="border-0 rounded-end">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {bookmarks?.length > 0 ? (
                          bookmarks.map((bookmark, index) => (
                            <tr key={index}>
                              <td>
                                <Link to={`/${bookmark.post?.slug}/`}>
                                  <img
                                    src={bookmark.post?.image}
                                    style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px'}}
                                    alt={bookmark.post?.title || 'Post image'}
                                  />
                                </Link>
                              </td>
                              <td>
                                <h6 className="mt-2 mt-md-0 mb-0">
                                  <Link to={`/${bookmark.post?.slug}/`} className="text-dark text-decoration-none">
                                    {bookmark.post?.title}
                                  </Link>
                                </h6>
                              </td>
                              <td>
                                <span className="text-muted">{bookmark.post?.profile?.full_name || bookmark.post?.user?.username || 'Unknown'}</span>
                              </td>
                              <td>
                                <h6 className="mb-0">
                                  <span className="text-dark">{bookmark.post?.view} Views</span>
                                </h6>
                              </td>
                              <td>{moment(bookmark.post?.date).format('DD MMM, YYYY')}</td>
                              <td>
                                <span className="badge bg-info bg-opacity-10 text-info">{moment(bookmark.date).format('DD MMM, YYYY')}</span>
                              </td>
                              <td>{bookmark.post?.category?.title}</td>
                              <td>
                                <span className={`badge ${getStatusBadge(bookmark.post).className} mb-2`}>{getStatusBadge(bookmark.post).text}</span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Link
                                    to={`/${bookmark.post?.slug}/`}
                                    className="btn btn-success btn-round mb-0"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="View Post"
                                  >
                                    <i className="bi bi-eye" />
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveBookmark(bookmark.id)}
                                    className="btn-round mb-0 btn btn-danger"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Remove Bookmark"
                                  >
                                    <i className="bi bi-bookmark-x" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center py-5">
                              <div className="d-flex flex-column align-items-center">
                                <i className="bi bi-bookmark text-muted" style={{fontSize: '3rem'}}></i>
                                <h5 className="text-muted mt-3">No bookmarks yet</h5>
                                <p className="text-muted">Start exploring and bookmark your favorite posts!</p>
                                <Link to="/" className="btn btn-primary mt-2">
                                  <i className="fas fa-search me-2"></i>Explore Posts
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Компонент пагинации */}
                  {bookmarks?.length > 0 && (
                    <PaginationComponent
                      pagination={pagination}
                      showPageSizeSelector={true}
                      pageSizeOptions={pageSizeOptions}
                      className="d-flex mt-4 justify-content-center"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Bookmarks
