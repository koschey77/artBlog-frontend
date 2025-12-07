import {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useParams} from 'react-router-dom'
import moment from 'moment'
import Toast from '../../plugin/Toast'
import useAxios from '../../utils/useAxios'
import useUserData from '../../plugin/useUserData'
import {useAuthStore} from '../../store/auth'

function AuthorDetail() {
  const {authorId} = useParams()
  const [authorData, setAuthorData] = useState(null)
  const [authorPosts, setAuthorPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const axiosInstance = useAxios()
  const userId = useUserData()?.user_id
  const authLoading = useAuthStore((state) => state.loading)

  const fetchAuthorData = async () => {
    try {
      setIsLoading(true)

      // Получаем все посты автора
      const response = await axiosInstance.get(`post/lists/`, {
        params: {
          author: authorId,
          page_size: 1000,
        },
      })

      if (response.data.results && response.data.results.length > 0) {
        const posts = response.data.results
        const firstPost = posts[0]

        // Собираем статистику
        let totalLikes = 0
        let totalComments = 0
        let totalViews = 0
        let totalBookmarks = 0

        posts.forEach((post) => {
          totalLikes += post.likes?.length || 0
          totalComments += post.comments?.length || 0
          totalViews += post.view || 0
        })

        // Получаем количество закладок (нужно отдельно)
        try {
          const bookmarksResponse = await axiosInstance.get(`post/lists/`, {
            params: {page_size: 1000},
          })
          bookmarksResponse.data.results?.forEach((post) => {
            if (post.user?.id === parseInt(authorId) && post.is_bookmarked) {
              totalBookmarks++
            }
          })
        } catch (error) {
          console.log('Could not fetch bookmarks:', error)
        }

        setAuthorData({
          id: firstPost.user.id,
          username: firstPost.user.username,
          full_name: firstPost.profile?.full_name || firstPost.user.username,
          image: firstPost.profile?.image || '/default-avatar.png',
          bio: firstPost.profile?.bio || '',
          about: firstPost.profile?.about || '',
          facebook: firstPost.profile?.facebook || '',
          twitter: firstPost.profile?.twitter || '',
          country: firstPost.profile?.country || '',
          date_joined: firstPost.user.date_joined,
          posts_count: posts.length,
          total_likes: totalLikes,
          total_comments: totalComments,
          total_views: totalViews,
          total_bookmarks: totalBookmarks,
        })

        setAuthorPosts(posts.slice(0, 6)) // Показываем только 6 последних постов
      } else {
        Toast('error', 'Author not found', '')
      }
    } catch (error) {
      console.error('Error fetching author data:', error)
      if (error.response?.status !== 401) {
        Toast('error', 'Error loading author data', 'Please try again later')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && authorId) {
      fetchAuthorData()
    }
  }, [authLoading, authorId])

  const handleLikePost = async (post) => {
    if (post.user.id == userId) {
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
        post_id: post.id,
      }
      await axiosInstance.post(`post/like-post/`, jsonData)

      // Обновляем только конкретный пост локально
      setAuthorPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? {
                ...p,
                is_liked: !p.is_liked,
                likes: p.is_liked ? p.likes.filter((like) => like.user !== userId) : [...p.likes, {user: userId}],
              }
            : p
        )
      )

      Toast('success', 'Post liked successfully', '')
    } catch (error) {
      console.error('Error liking post:', error)
      Toast('error', 'Error', 'Failed to like post')
    }
  }

  const handleBookmarkPost = async (post) => {
    if (!userId) {
      Toast('error', 'Authentication Required', 'Please login to bookmark posts')
      return
    }

    try {
      const jsonData = {
        user_id: userId,
        post_id: post.id,
      }
      await axiosInstance.post(`post/bookmark-post/`, jsonData)

      // Обновляем только конкретный пост локально
      setAuthorPosts((prevPosts) => prevPosts.map((p) => (p.id === post.id ? {...p, is_bookmarked: !p.is_bookmarked} : p)))

      Toast('success', 'Bookmark updated successfully', '')
    } catch (error) {
      console.error('Error bookmarking post:', error)
      Toast('error', 'Error', 'Failed to bookmark post')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="mt-5">
        <Header />
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading author profile...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!authorData) {
    return (
      <div className="mt-5">
        <Header />
        <div className="container text-center py-5">
          <h3>Author not found</h3>
          <Link to="/authors" className="btn btn-primary mt-3">
            Back to Authors
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="mt-5">
      <Header />

      {/* Author Profile Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              {/* Author Card */}
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <img
                    src={authorData.image}
                    alt={authorData.full_name}
                    className="rounded-circle mb-3"
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      border: '5px solid #f8f9fa',
                    }}
                  />
                  <h3 className="mb-2">{authorData.full_name}</h3>
                  <p className="text-muted mb-3">@{authorData.username}</p>

                  {authorData.bio && (
                    <p className="text-muted mb-3">
                      <em>"{authorData.bio}"</em>
                    </p>
                  )}

                  {/* Social Links */}
                  {(authorData.facebook || authorData.twitter) && (
                    <div className="mb-3">
                      {authorData.facebook && (
                        <a href={authorData.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm me-2">
                          <i className="fab fa-facebook"></i>
                        </a>
                      )}
                      {authorData.twitter && (
                        <a href={authorData.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {authorData.country && (
                    <p className="text-muted mb-3">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {authorData.country}
                    </p>
                  )}

                  {/* Member Since */}
                  <p className="text-muted">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Member since {moment(authorData.date_joined).format('MMM DD, YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {/* Statistics Cards */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-lg-3">
                  <div className="card bg-primary text-white shadow-sm">
                    <div className="card-body text-center">
                      <h2 className="mb-0">{authorData.posts_count}</h2>
                      <p className="mb-0">
                        <small>Total Posts</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card bg-danger text-white shadow-sm">
                    <div className="card-body text-center">
                      <h2 className="mb-0">{authorData.total_likes}</h2>
                      <p className="mb-0">
                        <small>Total Likes</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card bg-success text-white shadow-sm">
                    <div className="card-body text-center">
                      <h2 className="mb-0">{authorData.total_comments}</h2>
                      <p className="mb-0">
                        <small>Comments</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card bg-info text-white shadow-sm">
                    <div className="card-body text-center">
                      <h2 className="mb-0">{authorData.total_views}</h2>
                      <p className="mb-0">
                        <small>Total Views</small>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              {authorData.about && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="fas fa-user me-2"></i>About {authorData.full_name}
                    </h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                      {authorData.about}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              <i className="fas fa-newspaper me-2"></i>Recent Posts by {authorData.full_name}
            </h3>
            <Link to={`/?author=${authorData.id}`} className="btn btn-outline-primary">
              View All Posts <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          </div>

          {authorPosts.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
              <h5>No posts yet</h5>
            </div>
          ) : (
            <div className="row g-4">
              {authorPosts.map((post) => (
                <div className="col-md-6 col-lg-4" key={post.id}>
                  <div className="card h-100 shadow-sm">
                    <Link to={`/${post.slug}/`}>
                      <img src={post.image} className="card-img-top" style={{height: '200px', objectFit: 'cover'}} alt={post.title} />
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title">
                        <Link to={`/${post.slug}/`} className="text-dark text-decoration-none">
                          {post.title?.length > 50 ? post.title.slice(0, 50) + '...' : post.title}
                        </Link>
                      </h5>
                      <p className="text-muted small mb-3">
                        <i className="fas fa-calendar me-2"></i>
                        {moment(post.date).format('MMM DD, YYYY')}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleLikePost(post)
                            }}
                            className="btn btn-sm btn-link p-0 me-3"
                          >
                            <i className="fas fa-thumbs-up text-primary"></i> {post.likes?.length || 0}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleBookmarkPost(post)
                            }}
                            className="btn btn-sm btn-link p-0"
                          >
                            <i className={`fa${post.is_bookmarked ? 's' : 'r'} fa-bookmark text-success`}></i>
                          </button>
                        </div>
                        <span className="text-muted small">
                          <i className="fas fa-eye me-1"></i>
                          {post.view}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AuthorDetail
