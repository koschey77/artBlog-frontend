import React, {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useParams} from 'react-router-dom'
import moment from 'moment'
import Toast from '../../plugin/Toast'
import useUserData from '../../plugin/useUserData'
import useAxios from '../../utils/useAxios'
import {SERVER_URL} from '../../utils/constants'
import getAvatarUrl from '../../utils/avatarHelper'

import {Swiper, SwiperSlide} from 'swiper/react'
import 'swiper/css' // импортируем основной CSS
import 'swiper/css/navigation' // импортируем стили для кнопок навигации
import 'swiper/css/pagination' // импортируем стили для пагинации
import 'swiper/css/effect-fade'
import {Navigation, Pagination, EffectFade, Autoplay} from 'swiper/modules' // импортируем нужные модули

function Detail() {
  const [post, setPost] = useState([])
  const [tags, setTags] = useState([])
  const [createComment, setCreateComment] = useState({comment: ''})
  const [userProfile, setUserProfile] = useState(null)
  const [modalImage, setModalImage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const param = useParams()
  const userId = useUserData()?.user_id

  const axiosInstance = useAxios()

  const fetchPost = async () => {
    const response = await axiosInstance.get(`post/detail/${param.slug}/`)
    setPost(response.data)

    // Обработка тегов
    if (Array.isArray(response.data?.tags)) {
      setTags(response.data.tags)
    } else if (typeof response.data?.tags === 'string') {
      const tagArray = response.data.tags.split(',').map((tag) => tag.trim())
      setTags(tagArray)
    } else {
      setTags([])
    }
  }

  const fetchUserProfile = async () => {
    if (userId) {
      try {
        const response = await axiosInstance.get(`user/profile/${userId}/`)
        setUserProfile(response.data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
  }

  useEffect(() => {
    fetchPost()
    fetchUserProfile()
  }, [userId])

  const handleCreateCommentChange = (event) => {
    setCreateComment({
      ...createComment,
      [event.target.name]: event.target.value,
    })
  }

  const handleCreateCommentSubmit = async (e) => {
    e.preventDefault()

    // Проверка на пустой комментарий
    if (!createComment.comment || createComment.comment.trim() === '') {
      Toast('warning', 'Comment cannot be empty', 'Please write something before posting')
      return
    }

    const jsonData = {
      post_id: post?.id,
      name: userProfile?.full_name || useUserData()?.username || 'Anonymous',
      email: useUserData()?.email || 'no-email@example.com',
      comment: createComment.comment,
    }
    const response = await axiosInstance.post(`post/comment-post/`, jsonData)
    fetchPost()
    Toast('success', 'Comment Posted.', '')
    setCreateComment({
      comment: '',
    })
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

  // Function to handle image click and open modal
  const handleImageClick = (image, description) => {
    setModalImage({image, description})
    setShowModal(true)
  }

  // Function to close modal
  const closeModal = () => {
    setShowModal(false)
    setModalImage(null)
  }

  console.log('post', post)
  return (
    <>
      <Header />
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center mb-3 mt-3">
                <span className={`badge ${getStatusBadge(post).className} px-3 py-2 rounded-pill`} style={{opacity: 0.8}}>
                  {getStatusBadge(post).text}
                </span>
                {post.is_event && post.event_start_date && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-calendar-alt me-1"></i>
                      <span className="badge bg-light text-dark px-2 py-1">
                        from {moment(post.event_start_date).format('DD MMM, YYYY')}
                        {post.event_end_date && <> to {moment(post.event_end_date).format('DD MMM, YYYY')}</>}
                      </span>
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section py-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h2 className="text-white">{post.title}</h2>
              </div>

              <div className="gallery-container position-relative">
                <style>
                  {`
                    .swiper-container {
                      padding: 10px 0 40px 0;
                      margin: 0 60px;
                    }
                    
                    .swiper-button-next,
                    .swiper-button-prev {
                      background: rgba(255, 255, 255, 0.9);
                      color: #667eea !important;
                      border-radius: 50%;
                      width: 50px !important;
                      height: 50px !important;
                      margin-top: -25px !important;
                      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                      transition: all 0.3s ease;
                      backdrop-filter: blur(10px);
                    }
                    
                    .swiper-button-next:hover,
                    .swiper-button-prev:hover {
                      background: rgba(255, 255, 255, 1);
                      transform: scale(1.1);
                      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                    }
                    
                    .swiper-button-next:after,
                    .swiper-button-prev:after {
                      font-size: 18px !important;
                      font-weight: bold;
                    }
                    
                    .swiper-pagination {
                      bottom: 10px !important;
                    }
                    
                    .swiper-pagination-bullet {
                      width: 12px !important;
                      height: 12px !important;
                      background: rgba(255, 255, 255, 0.5) !important;
                      opacity: 1 !important;
                      margin: 0 8px !important;
                      transition: all 0.3s ease !important;
                    }
                    
                    .swiper-pagination-bullet-active {
                      background: white !important;
                      transform: scale(1.3);
                    }
                    
                    .gallery-item {
                      background: white;
                      border-radius: 15px;
                      overflow: hidden;
                      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                      transition: all 0.3s ease;
                      cursor: pointer;
                      display: flex;
                      flex-direction: column;
                    }
                    
                    .gallery-item:hover {
                      transform: translateY(-10px);
                      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    }
                    
                    .gallery-image-container {
                      position: relative;
                      flex-shrink: 0;
                    }
                    
                    .gallery-image {
                      width: 100%;
                      height: 320px;
                      object-fit: cover;
                      transition: transform 0.3s ease;
                      display: block;
                    }
                    
                    .gallery-item:hover .gallery-image {
                      transform: scale(1.05);
                    }
                    
                    .gallery-description {
                      padding: 15px;
                      text-align: center;
                      min-height: 60px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-grow: 1;
                    }
                    
                    .gallery-description h5 {
                      margin: 0;
                      color: #333;
                      font-weight: 600;
                      line-height: 1.4;
                    }
                    
                    .zoom-indicator {
                      position: absolute;
                      top: 15px;
                      right: 15px;
                      background: rgba(0, 0, 0, 0.7);
                      color: white;
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 16px;
                      transition: all 0.3s ease;
                      opacity: 0;
                    }
                    
                    .gallery-item:hover .zoom-indicator {
                      opacity: 1;
                      transform: scale(1.1);
                    }
                    
                    @media (max-width: 768px) {
                      .swiper-container {
                        margin: 0 20px;
                      }
                      
                      .swiper-button-next,
                      .swiper-button-prev {
                        width: 40px !important;
                        height: 40px !important;
                        margin-top: -20px !important;
                      }
                      
                      .gallery-image {
                        height: 250px;
                      }
                      
                      .gallery-description {
                        padding: 15px;
                        min-height: 60px;
                      }
                    }
                  `}
                </style>

                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation={(post?.gallery?.length || 0) + 1 > 1}
                  pagination={{clickable: true}}
                  autoplay={
                    (post?.gallery?.length || 0) + 1 > 2
                      ? {
                          delay: 4000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }
                      : false
                  }
                  loop={(post?.gallery?.length || 0) + 1 > 2}
                  initialSlide={1}
                  breakpoints={{
                    640: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 25,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                  }}
                  className="swiper-container"
                >
                  {/* Первая картинка галереи */}
                  {post?.gallery?.[0] && (
                    <SwiperSlide>
                      <div className="gallery-item" onClick={() => handleImageClick(post.gallery[0].image, post.gallery[0].description)}>
                        <div className="gallery-image-container">
                          <img
                            className="gallery-image"
                            src={post.gallery[0].image}
                            alt={post.gallery[0].description || 'Gallery image 1'}
                            loading="lazy"
                          />
                          <div className="zoom-indicator">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                        <div className="gallery-description">
                          <h5>{post.gallery[0].description || 'Gallery Image'}</h5>
                        </div>
                      </div>
                    </SwiperSlide>
                  )}

                  {/* Основная картинка поста как второй слайд (в центре) */}
                  {post?.image && (
                    <SwiperSlide>
                      <div className="gallery-item" onClick={() => handleImageClick(post.image, post.title)}>
                        <div className="gallery-image-container">
                          <img className="gallery-image" src={post.image} alt={post.title} loading="lazy" />
                          <div className="zoom-indicator">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                        <div className="gallery-description">
                          <h5>{post.title}</h5>
                        </div>
                      </div>
                    </SwiperSlide>
                  )}

                  {/* Остальные изображения галереи (начиная со второй) */}
                  {post?.gallery?.slice(1).map((slide, i) => (
                    <SwiperSlide key={i + 1}>
                      <div className="gallery-item" onClick={() => handleImageClick(slide.image, slide.description)}>
                        <div className="gallery-image-container">
                          <img className="gallery-image" src={slide.image} alt={slide.description || `Gallery image ${i + 2}`} loading="lazy" />
                          <div className="zoom-indicator">
                            <i className="fas fa-search-plus"></i>
                          </div>
                        </div>
                        <div className="gallery-description">
                          <h5>{slide.description || 'Gallery Image'}</h5>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {!post?.image && (!post?.gallery || post.gallery.length === 0) && (
                  <div className="text-center py-5">
                    <div className="text-white-50">
                      <i className="fas fa-image fa-3x mb-3"></i>
                      <p>No images in gallery</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for full-screen image view */}
      {showModal && modalImage && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  onClick={closeModal}
                  style={{
                    fontSize: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    padding: '10px',
                    margin: '20px',
                  }}
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center justify-content-center p-0">
                <div className="text-center">
                  <img
                    src={modalImage.image}
                    alt={modalImage.description}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '80vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                      cursor: 'pointer',
                    }}
                    onClick={closeModal}
                    title="Нажмите для закрытия"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="pt-0">
        <hr />
        <div className="container position-relative" data-sticky-container="">
          <div className="row">
            <div className="col-lg-2">
              <div className="text-start text-lg-center mb-5" data-sticky="" data-margin-top={80} data-sticky-for={991}>
                <div className="position-relative">
                  <div className="avatar avatar-xl">
                    <img
                      className="avatar-img"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      src={post.profile?.image}
                      alt="avatar"
                    />
                  </div>
                  <a href="#" className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block">
                    {post.profile?.full_name}
                  </a>
                  <p>Writer at ArtBlog</p>
                </div>

                <hr className="d-none d-lg-block " />

                <ul className="list-inline list-unstyled">
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <i className="fas fa-calendar"></i> {moment(post.date).format('MMMM D, YYYY')}
                  </li>
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <a href="#" className="text-body">
                      <i className="fas fa-heart me-1" />
                    </a>
                    {post.likes?.length} Likes
                  </li>
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <i className="fas fa-eye me-1" />
                    {post.view} Views
                  </li>
                </ul>
                {/* Tags */}
                <ul className="list-inline text-primary-hover mt-0 mt-lg-3 text-start">
                  {tags?.map((tag, i) => (
                    <li className="list-inline-item" key={i}>
                      <a className="text-body text-decoration-none fw-bold" href="#">
                        #{tag}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Category Link */}
                <div className="mt-3">
                  <a href={`/category/${post.category?.slug}/`} className="badge bg-success text-decoration-none px-3 py-2">
                    <i className="fas fa-folder me-2"></i>
                    {post.category?.title}
                  </a>
                </div>
              </div>
            </div>
            {/* Left sidebar END */}
            {/* Main Content START */}
            <div className="col-lg-10 mb-5">
              <p>{post.description}</p>
              <hr />
              <div className="d-flex py-4">
                <a href="#">
                  <div className="avatar avatar-xxl me-4">
                    <img
                      className="avatar-img rounded-circle"
                      src={post.profile?.image}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      alt="avatar"
                    />
                  </div>
                </a>
                <div>
                  <div className="d-sm-flex align-items-center justify-content-between">
                    <div>
                      <h4 className="m-0">
                        <a href="#" className="text-dark text-decoration-none">
                          {post.profile?.full_name}
                        </a>
                      </h4>
                      <small>Writer at ArtBlog</small>
                    </div>
                  </div>
                  <p className="my-2">{post.profile?.bio || 'This user has not added a bio yet.'}</p>
                  {/* Social icons */}
                  <ul className="nav">
                    <li className="nav-item">
                      <a className="nav-link ps-0 pe-2 fs-5" href="#">
                        <i className="fab fa-facebook-square" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link px-2 fs-5" href="#">
                        <i className="fab fa-twitter-square" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link px-2 fs-5" href="#">
                        <i className="fab fa-linkedin" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <hr />
              <div>
                <h3>{post.comments?.length} comments</h3>
                {post?.comments?.map((c, i) => (
                  <div className="my-4 d-flex bg-light p-3 mb-3 rounded" key={i}>
                    <img
                      className="avatar avatar-md rounded-circle float-start me-3"
                      src={getAvatarUrl(c.commentator_image)}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      alt="avatar"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png'
                      }}
                    />
                    <div>
                      <div className="mb-2">
                        <h5 className="m-0">{c?.name}</h5>
                        <span className="me-3 small">{moment(c.date).format('DD MMM, YYYY')}</span>
                      </div>
                      <p className="fw-bold">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments END */}
              {/* Reply START */}
              {userId ? (
                <div className="bg-light p-3 rounded">
                  <h3 className="fw-bold">Leave a reply</h3>
                  <p className="text-muted">
                    <small>
                      Commenting as <strong>{userProfile?.full_name || useUserData()?.username || 'User'}</strong>
                    </small>
                  </p>
                  <form className="row g-3 mt-2" onSubmit={handleCreateCommentSubmit}>
                    <div className="col-12">
                      <label className="form-label">Write Comment *</label>
                      <textarea
                        onChange={handleCreateCommentChange}
                        name="comment"
                        value={createComment.comment}
                        className="form-control"
                        rows={4}
                        placeholder="Share your thoughts..."
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        Post comment <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-light p-3 rounded text-center">
                  <h3 className="fw-bold">Leave a reply</h3>
                  <p className="text-muted mt-3">
                    <i className="fas fa-lock me-2"></i>
                    Please{' '}
                    <Link to="/login" className="text-primary fw-bold">
                      log in
                    </Link>{' '}
                    to leave a comment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer id="footer" className="footer position-relative dark-background" />
    </>
  )
}

export default Detail
