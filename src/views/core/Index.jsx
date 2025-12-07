import {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useSearchParams} from 'react-router-dom'
import moment from 'moment'
import useUserData from '../../plugin/useUserData'
import Toast from '../../plugin/Toast'
import useAxios from '../../utils/useAxios'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'
import {useAuthStore} from '../../store/auth'
import {trackPostLike, trackPostBookmark, trackCategoryView, trackSearch} from '../../utils/analytics'

function Index() {
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [category, setCategory] = useState([])
  const [authors, setAuthors] = useState([])
  const [topAuthors, setTopAuthors] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('') // Локальное состояние для поля ввода поиска
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    author: '',
    tag: '',
    content_type: '',
    sort_by: 'newest',
  })

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

      const response = await axiosInstance.get(`post/lists/`, {params})

      // Обработать ответ с пагинацией
      const postsList = pagination.handlePaginationResponse(response.data)
      setPosts(postsList)
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

  const fetchCategory = async () => {
    try {
      const response = await axiosInstance.get(`post/category/list/`)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading categories', 'Please try again later')
      }
    }
  }

  const fetchAuthors = async () => {
    try {
      // Получаем уникальных авторов из постов
      const response = await axiosInstance.get(`post/lists/`, {
        params: {page_size: 1000}, // Получаем все посты для извлечения авторов
      })

      // Извлекаем уникальных авторов
      const uniqueAuthors = []
      const authorIds = new Set()

      response.data.results?.forEach((post) => {
        if (post.user && !authorIds.has(post.user.id)) {
          authorIds.add(post.user.id)
          uniqueAuthors.push({
            id: post.user.id,
            username: post.user.username,
            full_name: post.profile?.full_name || post.user.username,
          })
        }
      })

      // Сортируем по имени
      uniqueAuthors.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setAuthors(uniqueAuthors)
    } catch (error) {
      console.error('Error fetching authors:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading authors', 'Please try again later')
      }
    }
  }

  const fetchTags = async () => {
    try {
      const response = await axiosInstance.get(`post/tags/`)
      setTags(response.data)
    } catch (error) {
      console.error('Error fetching tags:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading tags', 'Please try again later')
      }
    }
  }

  const fetchTopAuthors = async () => {
    try {
      const response = await axiosInstance.get(`authors/`)
      // Сортируем по общему количеству просмотров и берем топ-5
      const sortedAuthors = response.data.sort((a, b) => b.total_views - a.total_views).slice(0, 5)
      setTopAuthors(sortedAuthors)
    } catch (error) {
      console.error('Error fetching top authors:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading top authors', 'Please try again later')
      }
    }
  }

  // Инициализация данных
  const initializeData = async () => {
    // Ждем окончания процесса аутентификации
    if (authLoading) return

    try {
      await Promise.all([fetchCategory(), fetchAuthors(), fetchTags(), fetchTopAuthors()])
    } catch (error) {
      console.error('Error initializing data:', error)
    }
  }

  // Обработка URL параметров при монтировании и изменении
  useEffect(() => {
    if (authLoading) return

    const tagParam = searchParams.get('tag')
    const authorParam = searchParams.get('author')
    const categoryParam = searchParams.get('category')

    if (tagParam || authorParam || categoryParam) {
      setFilters((prev) => ({
        ...prev,
        tag: tagParam || prev.tag,
        author: authorParam || prev.author,
        category: categoryParam || prev.category,
      }))
    }
  }, [authLoading, searchParams])

  useEffect(() => {
    initializeData()
  }, [authLoading]) // Запускаем только после окончания загрузки аутентификации

  useEffect(() => {
    // Перезагружать посты при изменении пагинации или фильтров, но только если аутентификация завершена
    if (!authLoading) {
      fetchPosts()
    }
  }, [pagination.currentPage, pagination.pageSize, filters]) // Перезагружать при изменении страницы, размера или фильтров

  // Pagination
  // Используется серверная пагинация через usePagination хук

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

      // Обновляем только конкретный пост локально
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === p.id
            ? {
                ...post,
                is_liked: !post.is_liked,
                likes: post.is_liked ? post.likes.filter((like) => like.user !== userId) : [...post.likes, {user: userId}],
              }
            : post
        )
      )

      // Отслеживание лайка
      trackPostLike(p.id, p.title)

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

      // Обновляем только конкретный пост локально
      setPosts((prevPosts) => prevPosts.map((post) => (post.id === p.id ? {...post, is_bookmarked: !post.is_bookmarked} : post)))

      // Отслеживание закладки
      trackPostBookmark(p.id, p.title)

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
  const handleSearchSubmit = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
    }))
    pagination.setCurrentPage(1)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
    // Reset pagination to first page when filters change
    pagination.setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchInput('') // Очистить локальное состояние поиска
    setFilters({
      search: '',
      category: '',
      author: '',
      content_type: '',
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
    <div style={{marginTop: '40px'}}>
      <Header />

      {/* Categories Section - Horizontal */}
      <section className="pb-3 bg-light border-bottom">
        <div className="container-fluid px-3">
          <div className="d-flex gap-2 pb-2">
            {category?.map((c, index) => (
              <Link key={index} to={`/category/${c.slug}/`} className="text-decoration-none" style={{flex: '1 1 0'}}>
                <div className="text-center bg-white rounded p-2 shadow-sm hover-shadow h-100">
                  <img src={c.image} style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px'}} alt={c.title} />
                  <div className="mt-2">
                    <div className="fw-bold text-dark small">{c.title}</div>
                    <small className="text-muted">{c.post_count} posts</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="p-0">
        <div className="container">
          <div className="row">
            <div className="col">
              <a href="#" className="d-block card-img-flash">
                <img src="assets/images/adv-3.png" alt="" />
              </a>

              {/* Filters Row */}
              <div className="row mt-3 mb-3">
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    {/* Search */}
                    <div className="input-group" style={{maxWidth: '400px'}}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                      />
                      <button className="btn btn-primary" type="button" onClick={handleSearchSubmit}>
                        <i className="fas fa-search"></i> Find
                      </button>
                    </div>

                    {/* Right side - Pagination Info and Page Size Selector */}
                    <div className="d-flex flex-wrap gap-3 align-items-center text-muted">
                      {/* Results Info */}
                      {pagination.totalItems > 0 && (
                        <small>
                          Show {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} from {pagination.totalItems}
                        </small>
                      )}

                      {/* Page Size Selector */}
                      <div className="d-flex align-items-center">
                        <select
                          className="form-select form-select-sm"
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
                        <small className="ms-2">post(s) per page</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
          </div>
        </div>
      </section>

      <section className="pt-4 pb-0">
        <div className="container">
          <div className="row">
            {/* Основной контент с постами */}
            <div className="col-lg-9">
              <div className="row">
                {posts?.map((p, index) => (
                  <div className="col-sm-6 col-lg-4" key={index}>
                    <div className="card mb-3">
                      <div className="position-relative">
                        <Link className="text-center" to={`/${p.slug}/`}>
                          <img src={p.image} style={{width: '100%', height: '200px', objectFit: 'cover'}} alt="" />
                        </Link>
                        <span
                          className={`position-absolute top-0 start-0 badge ${getStatusBadge(p).className} m-2 px-2 py-1 rounded-pill`}
                          style={{opacity: 0.8}}
                        >
                          <small>{getStatusBadge(p).text}</small>
                        </span>
                      </div>
                      <div className="card-body px-3 pt-3">
                        <h5 className="card-title text-center">
                          <Link to={`${p.slug}`} className="btn-link text-reset fw-bold text-decoration-none">
                            {p.title?.length > 50 ? p.title.slice(0, 50) + '...' : p.title}
                          </Link>
                        </h5>

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
                            <Link to={`/author/${p.user?.id}/`} className="text-dark text-decoration-none">
                              <img
                                src={p.profile?.image}
                                className="rounded-circle ms-2"
                                style={{width: '40px', height: '40px', objectPosition: '50% 50%', objectFit: 'cover'}}
                                alt=""
                              />
                              <br />
                              <small>
                                <b>Author: </b>
                              </small>
                              <small>
                                <i>{p.profile?.full_name}</i>
                              </small>
                            </Link>
                          </li>
                          <li className="mt-2">
                            <small>
                              <i className="fas fa-calendar"></i> {moment(p.date).format('DD MMM, YYYY')}
                            </small>
                          </li>
                          <li className="mt-2">
                            <small>
                              <i className="fas fa-eye"></i> {p.view} Views
                            </small>
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

            {/* Sidebar с фильтрами и категориями */}
            <aside className="col-lg-3">
              {/* Панель фильтров */}
              <div className="bg-light rounded p-4 mb-4">
                <div className="mb-3">
                  <h5 className="text-center">Filters</h5>
                </div>

                {/* Category Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <small>Category</small>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {category?.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <small>Author</small>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                  >
                    <option value="">All Authors</option>
                    {authors?.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <small>Tags</small>
                  </label>
                  <select className="form-select form-select-sm" value={filters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)}>
                    <option value="">All Tags</option>
                    {tags?.map((tag) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.name} ({tag.post_count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Type Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <small>Content Type</small>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.content_type}
                    onChange={(e) => handleFilterChange('content_type', e.target.value)}
                  >
                    <option value="">All Content</option>
                    <option value="articles">Articles</option>
                    <option value="upcoming_events">Upcoming Events</option>
                    <option value="current_events">Current Events</option>
                    <option value="completed_events">Completed Events</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <small>Sort By</small>
                  </label>
                  <select
                    className="form-select form-select-sm"
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
                </div>

                {/* Reset Button */}
                <button className="btn btn-outline-secondary btn-sm w-100" onClick={resetFilters}>
                  <i className="fas fa-redo me-2"></i>Reset Filters
                </button>
              </div>

              {/* Top Authors Panel */}
              <div className="bg-light rounded p-4 mb-4">
                <div className="mb-3">
                  <h5 className="text-center">Top Authors</h5>
                </div>
                <div className="d-flex flex-column gap-3">
                  {topAuthors?.map((author, index) => (
                    <Link key={author.id} to={`/author/${author.id}/`} className="text-decoration-none">
                      <div className="bg-white rounded p-3 shadow-sm hover-shadow">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <img
                            src={author.image}
                            alt={author.full_name}
                            className="rounded-circle"
                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-0 text-dark">{author.full_name}</h6>
                            <small className="text-muted">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {moment(author.date_joined).format('MMM YYYY')}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between text-center">
                          <div>
                            <div className="fw-bold text-primary small">{author.total_views}</div>
                            <small className="text-muted">Views</small>
                          </div>
                          <div>
                            <div className="fw-bold text-success small">{author.posts_count}</div>
                            <small className="text-muted">Posts</small>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />

      <style>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  )
}

export default Index
