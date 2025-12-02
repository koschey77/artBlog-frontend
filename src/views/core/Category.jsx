import {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useParams} from 'react-router-dom'
import moment from 'moment'
import useUserData from '../../plugin/useUserData'
import Toast from '../../plugin/Toast'
import useAxios from '../../utils/useAxios'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'
import {useAuthStore} from '../../store/auth'

function Category() {
  const [posts, setPosts] = useState([])
  const [category, setCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    event_status: '',
    sort_by: 'newest',
  })

  const param = useParams()
  const userId = useUserData()?.user_id
  const axiosInstance = useAxios()
  const authLoading = useAuthStore((state) => state.loading)

  // Пагинация
  const pagination = usePagination(6) // размер страницы по умолчанию

  // Размеры страниц для выбора
  const pageSizeOptions = [6, 12, 24, 48, 96]

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = {
        ...pagination.getPaginationParams(),
        ...filters,
      }

      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await axiosInstance.get(`post/category/posts/${param.slug}/`, {params})

      // Обработать ответ с пагинацией
      const postsList = pagination.handlePaginationResponse(response.data)
      setPosts(postsList)

      // Получить информацию о категории из первого поста
      if (response.data.results && response.data.results.length > 0) {
        setCategory(response.data.results[0].category)
      }

      console.log(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading posts', 'Please try again later')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Инициализация данных
  const initializeData = async () => {
    // Ждем окончания процесса аутентификации
    if (authLoading) return

    try {
      await fetchPosts()
    } catch (error) {
      console.error('Error initializing data:', error)
    }
  }

  useEffect(() => {
    initializeData()
  }, [authLoading, param.slug]) // Запускаем только после окончания загрузки аутентификации

  useEffect(() => {
    // Перезагружать посты при изменении пагинации или фильтров, но только если аутентификация завершена
    if (!authLoading) {
      fetchPosts()
    }
  }, [pagination.currentPage, pagination.pageSize, filters]) // Перезагружать при изменении страницы, размера или фильтров

  const handleLikePost = async (p) => {
    if (p.user.id == userId) {
      Toast('error', 'It Is Your Post', 'You cannot like your own post')
      return
    }

    if (!userId) {
      Toast('error', 'Authentication Required', 'Please login to like posts')
      return
    }

    try {
      const jsonData = {
        user_id: userId,
        post_id: p.id,
      }
      const response = await axiosInstance.post(`post/like-post/`, jsonData)
      fetchPosts()
      Toast('success', response.data.message, '')
    } catch (error) {
      console.error('Error liking post:', error)
      if (error.response?.status === 401) {
        Toast('error', 'Authentication Required', 'Please login again')
      } else {
        Toast('error', 'Error', 'Failed to like post')
      }
    }
  }

  const handleBookmarkPost = async (p) => {
    if (!userId) {
      Toast('error', 'Authentication Required', 'Please login to bookmark posts')
      return
    }

    try {
      const jsonData = {
        user_id: userId,
        post_id: p.id,
      }
      const response = await axiosInstance.post(`post/bookmark-post/`, jsonData)
      fetchPosts()
      Toast('success', response.data.message, '')
    } catch (error) {
      console.error('Error bookmarking post:', error)
      if (error.response?.status === 401) {
        Toast('error', 'Authentication Required', 'Please login again')
      } else {
        Toast('error', 'Error', 'Failed to bookmark post')
      }
    }
  }

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
    // Reset pagination to first page when filters change
    pagination.setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      event_status: '',
      sort_by: 'newest',
    })
    pagination.setCurrentPage(1)
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
          className: 'bg-warning',
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

  console.log('posts:', posts)

  // Показываем загрузку пока идет процесс аутентификации или загрузки данных
  if (authLoading || isLoading) {
    return (
      <div className="mt-5">
        <Header />
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading content...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="mt-5">
      <Header />
      <section className="p-0">
        <div className="container">
          <div className="row">
            <div className="col">
              <a href="#" className="d-block card-img-flash">
                <img src="/assets/images/adv-3.png" alt="" />
              </a>
              <div className="d-flex justify-content-between align-items-center mt-1">
                <h2 className="text-start d-block m-0">
                  <i className="bi bi-grid-fill"></i> {category?.title} ({pagination.totalItems} Articles)
                </h2>
              </div>

              {/* Filters Row */}
              <div className="row mt-3 mb-3">
                <div className="col-12">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    {/* Left side - Filters */}
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {/* Search */}
                      <input
                        type="text"
                        className="form-control"
                        style={{maxWidth: '200px'}}
                        placeholder="Search by title..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />

                      {/* Event Status Filter */}
                      <select
                        className="form-select"
                        style={{maxWidth: '180px'}}
                        value={filters.event_status}
                        onChange={(e) => handleFilterChange('event_status', e.target.value)}
                      >
                        <option value="">All Content</option>
                        <option value="upcoming">Upcoming Events</option>
                        <option value="current">Current Events</option>
                        <option value="completed">Completed Events</option>
                        <option value="events_only">Events Only</option>
                        <option value="non_events">Articles Only</option>
                      </select>

                      {/* Sort By */}
                      <select
                        className="form-select"
                        style={{maxWidth: '150px'}}
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="title_asc">Title A-Z</option>
                        <option value="title_desc">Title Z-A</option>
                        <option value="views_desc">Most Views</option>
                        <option value="views_asc">Least Views</option>
                        <option value="likes_desc">Most Likes</option>
                        <option value="likes_asc">Least Likes</option>
                        <option value="author_asc">Author A-Z</option>
                        <option value="author_desc">Author Z-A</option>
                      </select>

                      {/* Reset Button */}
                      <button className="btn btn-outline-secondary" onClick={resetFilters} style={{whiteSpace: 'nowrap'}}>
                        Reset Filters
                      </button>
                    </div>

                    {/* Right side - Pagination info and page size selector */}
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      {/* Results info */}
                      {pagination.totalItems > 0 && (
                        <small className="text-muted" style={{whiteSpace: 'nowrap'}}>
                          Show {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} from {pagination.totalItems} post(s)
                        </small>
                      )}

                      {/* Page size selector */}
                      <div className="d-flex align-items-center gap-2" style={{whiteSpace: 'nowrap'}}>
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
                        <span className="text-muted">per page</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-0">
        <div className="container">
          <div className="row">
            {posts?.map((p, index) => (
              <div className="col-sm-4 col-lg-3" key={index}>
                <div className="card mb-3">
                  <div className="position-relative">
                    <Link className="text-center" to={`/${p.slug}/`}>
                      <img src={p.image} style={{width: '300px', height: '300px', objectFit: 'cover'}} alt="" />
                    </Link>
                    <span
                      className={`position-absolute top-0 start-0 badge ${getStatusBadge(p).className} m-2 px-2 py-1 rounded-pill`}
                      style={{opacity: 0.8}}
                    >
                      <small>{getStatusBadge(p).text}</small>
                    </span>
                  </div>
                  <div className="card-body px-3 pt-3">
                    <h4 className="card-title">
                      <Link to={`/${p.slug}`} className="btn-link text-reset fw-bold text-decoration-none">
                        {p.title?.slice(0, 32) + '  ...'}
                      </Link>
                    </h4>

                    <button type="button" onClick={() => handleBookmarkPost(p)} style={{border: 'none', background: 'none'}}>
                      {p.is_bookmarked ? (
                        <i className="fas fa-bookmark text-success" title="Remove from bookmarks"></i>
                      ) : (
                        <i className="far fa-bookmark text-danger" title="Add to bookmarks"></i>
                      )}
                    </button>
                    <button type="button" onClick={() => handleLikePost(p)} style={{border: 'none', background: 'none'}}>
                      <i className="fas fa-thumbs-up text-primary"></i>
                    </button>
                    {p.likes?.length}
                    <ul className="mt-3 list-style-none" style={{listStyle: 'none'}}>
                      <li className="">
                        <a href="#" className="text-dark text-decoration-none">
                          <img
                            src={p.profile?.image}
                            className="rounded-circle ms-2"
                            style={{width: '50px', height: '50px', objectPosition: '50% 50%', objectFit: 'cover'}}
                            alt=""
                          />
                          <br />
                          <b>Author: </b>
                          <i>{p.profile?.full_name}</i>
                        </a>
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-calendar"></i> {moment(p.date).format('DD MMM, YYYY')}
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-eye"></i> {p.view} Views
                      </li>
                    </ul>
                    {p.is_event && p.event_start_date && (
                      <div className="mb-2 text-center">
                        <small className="text-muted">
                          <i className="fas fa-calendar-alt me-1"></i>
                          <span className="text-dark">
                            from {moment(p.event_start_date).format('DD MMM, YYYY')}
                            {p.event_end_date && <> to {moment(p.event_end_date).format('DD MMM, YYYY')}</>}
                          </span>
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Компонент пагинации */}
          <PaginationComponent pagination={pagination} showPageSizeSelector={false} pageSizeOptions={pageSizeOptions} />
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Category
