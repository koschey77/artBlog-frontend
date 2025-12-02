import {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link} from 'react-router-dom'
import moment from 'moment'
import Toast from '../../plugin/Toast'
import useAxios from '../../utils/useAxios'
import {useAuthStore} from '../../store/auth'

function Authors() {
  const [authors, setAuthors] = useState([])
  const [allAuthors, setAllAuthors] = useState([]) // Все авторы для пагинации
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('') // Локальное состояние для поля ввода
  const [sortBy, setSortBy] = useState('name_asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const axiosInstance = useAxios()
  const authLoading = useAuthStore((state) => state.loading)

  const pageSizeOptions = [12, 24, 48]

  const fetchAuthors = async () => {
    try {
      setIsLoading(true)
      // Получаем всех авторов через специальный endpoint
      const response = await axiosInstance.get(`authors/`)

      let authorsArray = response.data || []

      // Фильтрация по поиску
      if (searchTerm) {
        authorsArray = authorsArray.filter((author) => author.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      // Сортировка
      switch (sortBy) {
        case 'name_asc':
          authorsArray.sort((a, b) => a.full_name.localeCompare(b.full_name))
          break
        case 'name_desc':
          authorsArray.sort((a, b) => b.full_name.localeCompare(a.full_name))
          break
        case 'posts_desc':
          authorsArray.sort((a, b) => b.posts_count - a.posts_count)
          break
        case 'posts_asc':
          authorsArray.sort((a, b) => a.posts_count - b.posts_count)
          break
        case 'likes_desc':
          authorsArray.sort((a, b) => b.total_likes - a.total_likes)
          break
        case 'newest':
          authorsArray.sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
          break
        case 'oldest':
          authorsArray.sort((a, b) => new Date(a.date_joined) - new Date(b.date_joined))
          break
        default:
          break
      }

      // Сохраняем все авторы и применяем пагинацию на клиенте
      setAllAuthors(authorsArray)

      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedAuthors = authorsArray.slice(startIndex, endIndex)

      setAuthors(paginatedAuthors)
    } catch (error) {
      console.error('Error fetching authors:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading authors', 'Please try again later')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchAuthors()
    }
  }, [authLoading, currentPage, pageSize, searchTerm, sortBy])

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput)
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  if (authLoading || isLoading) {
    return (
      <div className="mt-5">
        <Header />
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading authors...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="mt-5">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 mb-3">Our Authors</h1>
              <p className="lead">Meet the talented writers and creators behind our content</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
                {/* Search */}
                <div className="flex-grow-1" style={{maxWidth: '400px'}}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search authors by name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                    />
                    <button className="btn btn-primary" type="button" onClick={handleSearchSubmit}>
                      <i className="fas fa-search"></i> Find
                    </button>
                  </div>
                </div>

                {/* Sort */}
                <div className="d-flex gap-2 align-items-center">
                  <label className="mb-0 text-nowrap">
                    <small>Sort by:</small>
                  </label>
                  <select className="form-select form-select-sm" value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="posts_desc">Most Posts</option>
                    <option value="posts_asc">Least Posts</option>
                    <option value="likes_desc">Most Likes</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>

                {/* Page Size */}
                <div className="d-flex gap-2 align-items-center">
                  <select
                    className="form-select form-select-sm"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted text-nowrap">per page</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="py-5">
        <div className="container">
          {authors.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h4>No authors found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {authors.map((author) => (
                  <div className="col-md-6 col-lg-4 col-xl-3" key={author.id}>
                    <Link to={`/author/${author.id}/`} className="text-decoration-none">
                      <div className="card h-100 shadow-sm hover-shadow transition">
                        <div className="card-body text-center">
                          {/* Avatar */}
                          <div className="mb-3">
                            <img
                              src={author.image}
                              alt={author.full_name}
                              className="rounded-circle"
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                border: '4px solid #f8f9fa',
                              }}
                            />
                          </div>

                          {/* Name */}
                          <h5 className="card-title mb-2 text-dark">{author.full_name}</h5>

                          {/* Bio */}
                          {author.bio && (
                            <p className="text-muted small mb-3" style={{minHeight: '40px'}}>
                              {author.bio.length > 60 ? author.bio.slice(0, 60) + '...' : author.bio}
                            </p>
                          )}

                          {/* Statistics */}
                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <div className="bg-light rounded p-2">
                                <div className="fw-bold text-primary">{author.posts_count}</div>
                                <small className="text-muted">Posts</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="bg-light rounded p-2">
                                <div className="fw-bold text-danger">{author.total_likes}</div>
                                <small className="text-muted">Likes</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="bg-light rounded p-2">
                                <div className="fw-bold text-success">{author.total_comments}</div>
                                <small className="text-muted">Comments</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="bg-light rounded p-2">
                                <div className="fw-bold text-info">{author.total_views}</div>
                                <small className="text-muted">Views</small>
                              </div>
                            </div>
                          </div>

                          {/* Member Since */}
                          <div className="text-muted">
                            <small>
                              <i className="fas fa-calendar-alt me-1"></i>
                              Member since {moment(author.date_joined).format('MMM YYYY')}
                            </small>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="card-footer bg-transparent border-top-0 text-center">
                          <span className="btn btn-sm btn-outline-primary">
                            View Profile <i className="fas fa-arrow-right ms-1"></i>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {allAuthors.length > pageSize && (
                <div className="mt-5">
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                          Previous
                        </button>
                      </li>
                      {Array.from({length: Math.ceil(allAuthors.length / pageSize)}, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(page)}>
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === Math.ceil(allAuthors.length / pageSize) ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === Math.ceil(allAuthors.length / pageSize)}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .transition {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}

export default Authors
