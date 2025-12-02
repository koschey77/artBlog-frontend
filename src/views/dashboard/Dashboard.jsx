import {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link} from 'react-router-dom'
import useAxios from '../../utils/useAxios'
import useUserData from '../../plugin/useUserData'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'
import moment from 'moment'
import Toast from '../../plugin/Toast'
import {SERVER_URL} from '../../utils/constants'
import getAvatarUrl from '../../utils/avatarHelper'

function Dashboard() {
  const axiosInstance = useAxios()
  const [stats, setStats] = useState([])
  const [posts, setPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([]) // Для отображения в карточке "All Posts"
  const [bookmarks, setBookmarks] = useState([]) // Для отображения в карточке "Bookmarks"
  const [comments, setComments] = useState([])
  const [noti, setNoti] = useState([])

  const userId = useUserData()?.user_id

  // Пагинация для постов в таблице
  const pagination = usePagination(6) // 6 постов на странице для dashboard

  // Размеры страниц для dashboard
  const pageSizeOptions = [6, 12, 24, 48]

  const fetchDashboardData = async () => {
    const stats_res = await axiosInstance.get(`author/dashboard/stats/${userId}/`)
    setStats(stats_res.data[0])
    console.log('stats', stats_res.data[0])

    // Загружаем посты с пагинацией для таблицы
    const params = pagination.getPaginationParams()
    const post_res = await axiosInstance.get(`author/dashboard/post-list/${userId}`, {params})
    const postsList = pagination.handlePaginationResponse(post_res.data)
    setPosts(postsList)
    console.log('posts', post_res.data)

    // Загружаем последние посты для карточки "All Posts"
    const recent_posts_res = await axiosInstance.get(`author/dashboard/post-list/${userId}`, {
      params: {page: 1, page_size: 3},
    })
    setRecentPosts(recent_posts_res.data.results || recent_posts_res.data)

    // Загружаем последние закладки пользователя
    const bookmarks_res = await axiosInstance.get(`author/dashboard/bookmark-list/${userId}`, {
      params: {page: 1, page_size: 3},
    })
    setBookmarks(bookmarks_res.data.results || bookmarks_res.data)
    console.log('bookmarks', bookmarks_res.data)

    const comment_res = await axiosInstance.get(`author/dashboard/comment-list/${userId}/`)
    setComments(comment_res.data)
    console.log('comments', comment_res.data)

    const noti_res = await axiosInstance.get(`author/dashboard/noti-list/${userId}/`)
    setNoti(noti_res.data)
    console.log('noti', noti_res.data)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [pagination.currentPage, pagination.pageSize])

  const handleMarkNotiAsSeen = async (notiId) => {
    const response = await axiosInstance.post('author/dashboard/noti-mark-seen/', {noti_id: notiId})
    console.log(response.data)
    fetchDashboardData()
    Toast('success', 'Notification Seen', '')
  }

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
  return (
    <>
      <Header />
      <section className="mt-5 py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-body border p-3">
                    <div className="d-flex align-items-center">
                      <div className="icon-xl fs-1 p-3 bg-success bg-opacity-10 rounded-3 text-success">
                        <i className="bi bi-people-fill" />
                      </div>
                      <div className="ms-3">
                        <h3>{stats.views}</h3>
                        <h6 className="mb-0">Total Views</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-body border p-3">
                    <div className="d-flex align-items-center">
                      <div className="icon-xl fs-1 p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                        <i className="bi bi-file-earmark-text-fill" />
                      </div>
                      <div className="ms-3">
                        <h3>{stats.posts}</h3>
                        <h6 className="mb-0">Posts</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-body border p-3">
                    <div className="d-flex align-items-center">
                      <div className="icon-xl fs-1 p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                        <i className="bi bi-suit-heart-fill" />
                      </div>
                      <div className="ms-3">
                        <h3>{stats.likes}</h3>
                        <h6 className="mb-0">Likes</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-body border p-3">
                    <div className="d-flex align-items-center">
                      <div className="icon-xl fs-1 p-3 bg-info bg-opacity-10 rounded-3 text-info">
                        <i className="bi bi-tag" />
                      </div>
                      <div className="ms-3">
                        <h3>{stats.bookmarks}</h3>
                        <h6 className="mb-0">Bookmarks</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xxl-4">
              <div className="card border h-100">
                <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                  <h5 className="card-header-title mb-0">Bookmarks ({stats.bookmarks})</h5>
                  <div className="dropdown text-end">
                    <a href="#" className="btn border-0 p-0 mb-0" role="button" id="dropdownShare3" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-bookmark-fill text-info fa-fw" />
                    </a>
                  </div>
                </div>
                <div className="card-body p-3">
                  <div className="row">
                    {bookmarks?.slice(0, 3)?.map((bookmark, index) => (
                      <div key={index}>
                        <div className="col-12">
                          <div className="d-flex position-relative">
                            <Link to={`/${bookmark.post?.slug}/`}>
                              <img src={bookmark.post?.image} style={{width: '100px', height: '100px', objectFit: 'contain'}} alt="" />
                            </Link>
                            <div className="ms-3">
                              <Link to={`/${bookmark.post?.slug}/`} className="h6 text-decoration-none text-dark">
                                {bookmark.post?.title}
                              </Link>
                              <p className="small mb-0 mt-3">
                                <i className="fas fa-bookmark me-2"></i>
                                Bookmarked: {moment(bookmark.date).format('DD MMM, YYYY')}
                              </p>
                              <p className="small mb-0">
                                <i className="fas fa-eye me-2"></i>
                                {bookmark.post?.view} Views
                              </p>
                              <p className="small mb-0">
                                <i className="fas fa-thumbs-up me-2"></i>
                                {bookmark.post?.likes?.length} Likes
                              </p>
                            </div>
                          </div>
                        </div>
                        <hr className="my-3" />
                      </div>
                    ))}
                    {bookmarks?.length === 0 && (
                      <div className="col-12 text-center">
                        <p className="text-muted">No bookmarks yet</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer border-top text-center p-3">
                  <Link to="/bookmarks/" className="fw-bold text-decoration-none text-dark">
                    View all Bookmarks
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xxl-4">
              <div className="card border h-100">
                <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                  <h5 className="card-header-title mb-0">Comments ({comments?.length})</h5>
                  <div className="dropdown text-end">
                    <a href="#" className="btn border-0 p-0 mb-0" role="button" id="dropdownShare3" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-chat-left-quote-fill text-success fa-fw" />
                    </a>
                  </div>
                </div>
                <div className="card-body p-3">
                  <div className="row">
                    {comments?.slice(0, 3).map((c, index) => (
                      <div key={index}>
                        <div className="col-12">
                          <div className="d-flex align-items-center position-relative">
                            <div className="avatar avatar-lg flex-shrink-0">
                              <img
                                className="avatar-img"
                                src={getAvatarUrl(c.commentator_image)}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                }}
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png'
                                }}
                                alt="avatar"
                              />
                            </div>
                            <div className="ms-3">
                              <p className="mb-1">
                                <a className="h6 stretched-link text-decoration-none text-dark" href="#">
                                  {c.comment}
                                </a>
                              </p>
                              <div className="d-flex justify-content-between">
                                <p className="small mb-0">
                                  <i>by</i> <b>{c.name}</b> <br />
                                  <i>At</i> {moment(c.date).format('HH:mm / DD MMM, YYYY')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="my-3" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-footer border-top text-center p-3">
                  <Link to="/comments/" className="fw-bold text-decoration-none text-dark">
                    View all Comments
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xxl-4">
              <div className="card border h-100">
                <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                  <h5 className="card-header-title mb-0">Notifications ({noti?.length})</h5>
                  <div className="dropdown text-end">
                    <a href="#" className="btn border-0 p-0 mb-0" role="button" id="dropdownShare3" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fas fa-bell text-warning fa-fw" />
                    </a>
                  </div>
                </div>
                <div className="card-body p-3">
                  <div className="custom-scrollbar h-350">
                    <div className="row">
                      {noti?.slice(0, 3)?.map((n, index) => (
                        <div key={index}>
                          <div className="col-12">
                            <div className="d-flex justify-content-between position-relative">
                              <div className="d-sm-flex">
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Like' && <i className="fas fa-thumbs-up text-primary fs-5" />}
                                </div>
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Comment' && <i className="bi bi-chat-left-quote-fill  text-success fs-5" />}
                                </div>
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Bookmark' && <i className="fas fa-bookmark text-danger fs-5" />}
                                </div>
                                <div className="ms-0 ms-sm-3 mt-2 mt-sm-0">
                                  <h6 className="mb-0">{n.type}</h6>
                                  <div className="mb-0">
                                    {n.type === 'Like' && (
                                      <span>
                                        <b>{n.user.full_name}</b> liked your post <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                      </span>
                                    )}
                                    {n.type === 'Comment' && (
                                      <span>
                                        You have a new comment on <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                        <br /> from <b>{n.user.full_name}</b>
                                      </span>
                                    )}
                                    {n.type === 'Bookmark' && (
                                      <span>
                                        <b>{n.user.full_name}</b> bookmarked your post <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                      </span>
                                    )}
                                  </div>
                                  <span className="small">at {moment(n.date).format('HH:mm / DD MMM, YYYY')}</span>
                                  <br />
                                  <button onClick={() => handleMarkNotiAsSeen(n.id)} className="btn btn-danger fs-11 mt-2">
                                    <i className="fas fa-check-circle"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <hr className="my-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-footer border-top text-center p-3">
                  <Link to="/notifications/" className="fw-bold text-decoration-none text-dark">
                    View all Notifications
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border bg-transparent rounded-3">
                <div className="card-header bg-transparent border-bottom p-3">
                  <div className="d-sm-flex justify-content-between align-items-center">
                    <h5 className="mb-2 mb-sm-0">
                      All Blog Posts
                      {pagination.totalItems > 0 && <span className="badge bg-primary bg-opacity-10 text-primary">{pagination.totalItems}</span>}
                    </h5>
                    <a href="/add-post/" className="btn btn-sm btn-primary mb-0">
                      Add New <i className="fas fa-plus"></i>
                    </a>
                  </div>
                </div>
                <div className="card-body">
                  {/* Pagination info and controls START */}
                  <div className="d-sm-flex justify-content-between align-items-center mb-3">
                    {/* Left side - Pagination info */}
                    <div className="d-flex align-items-center">
                      {pagination.totalItems > 0 && (
                        <small className="text-muted">
                          Show {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} from {pagination.totalItems}
                        </small>
                      )}
                    </div>

                    {/* Right side - Page size selector */}
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-2">Show</span>
                      <select
                        className="form-select form-select-sm"
                        style={{width: 'auto', minWidth: '70px'}}
                        value={pagination.pageSize}
                        onChange={(e) => pagination.changePageSize(parseInt(e.target.value))}
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted ms-2">items per page</span>
                    </div>
                  </div>
                  {/* Pagination info and controls END */}

                  {/* Search and select END */}
                  {/* Blog list table START */}
                  <div className="table-responsive border-0">
                    <table className="table align-middle p-4 mb-0 table-hover table-shrink">
                      {/* Table head */}
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" className="border-0 rounded-start">
                            Image
                          </th>
                          <th scope="col" className="border-0 rounded-start">
                            Article Name
                          </th>
                          <th scope="col" className="border-0">
                            Views
                          </th>
                          <th scope="col" className="border-0">
                            Published Date
                          </th>
                          <th scope="col" className="border-0">
                            Category
                          </th>
                          <th scope="col" className="border-0">
                            Event Status
                          </th>
                          <th scope="col" className="border-0">
                            Event Dates
                          </th>
                          <th scope="col" className="border-0 rounded-end">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {posts?.map((p, index) => (
                          <tr key={index}>
                            <td>
                              <Link to={`/${p.slug}/`}>
                                <img src={p.image} style={{width: '100px', height: '100px', objectFit: 'contain', borderRadius: '10px'}} alt="" />
                              </Link>
                            </td>
                            <td>
                              <h6 className="mt-2 mt-md-0 mb-0 ">
                                <a href="#" className="text-dark text-decoration-none">
                                  {p?.title}
                                </a>
                              </h6>
                            </td>
                            <td>
                              <h6 className="mb-0">
                                <a href="#" className="text-dark text-decoration-none">
                                  {p.view} Views
                                </a>
                              </h6>
                            </td>
                            <td>{moment(p.date).format('DD MMM, YYYY')}</td>
                            <td>{p.category?.title}</td>
                            <td>
                              <span className={`badge ${getStatusBadge(p).className} mb-2`}>{getStatusBadge(p).text}</span>
                            </td>
                            <td>
                              {p.is_event && p.event_start_date ? (
                                <div>
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    <strong>From:</strong> {moment(p.event_start_date).format('DD MMM, YYYY')}
                                    {p.event_end_date && (
                                      <>
                                        <br />
                                        <i className="fas fa-calendar-check me-1"></i>
                                        <strong>To:</strong> {moment(p.event_end_date).format('DD MMM, YYYY')}
                                      </>
                                    )}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={async () => {
                                    await axiosInstance.delete(`author/dashboard/post-detail/${userId}/${p.id}/`)
                                    fetchDashboardData()
                                  }}
                                  className="btn-round mb-0 btn btn-danger"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Delete"
                                >
                                  <i className="bi bi-trash" />
                                </button>
                                <a
                                  href={`/edit-post/${p.id}/`}
                                  className="btn btn-primary btn-round mb-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Компонент пагинации */}
                  <PaginationComponent
                    pagination={pagination}
                    showPageSizeSelector={false}
                    pageSizeOptions={pageSizeOptions}
                    className="d-flex mt-4 justify-content-center"
                  />
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

export default Dashboard
