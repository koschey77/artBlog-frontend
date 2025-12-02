import React, {useEffect, useState} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'
import useUserData from '../../plugin/useUserData'
import Toast from '../../plugin/Toast'
import Swal from 'sweetalert2'
import useAxios from '../../utils/useAxios'

function EditPost() {
  const axiosInstance = useAxios()
  const userId = useUserData()?.user_id
  const [post, setEditPost] = useState({
    image: '',
    title: '',
    description: '',
    category: parseInt(''),
    tags: '',
    event_start_date: '',
    event_end_date: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [categoryList, setCategoryList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGalleryLoading, setIsGalleryLoading] = useState(false)
  const navigate = useNavigate()
  const param = useParams()
  const [gallery, setGallery] = useState([{id: uuidv4(), image: null, description: ''}])
  const [originalGallery, setOriginalGallery] = useState([]) // Храним оригинальное состояние

  const fetchPost = async () => {
    const response = await axiosInstance.get(`author/dashboard/post-detail/${userId}/${param.id}/`)
    setEditPost(response.data)
  }

  const fetchCategory = async () => {
    const response = await axiosInstance.get(`post/category/list/`)
    setCategoryList(response.data)
  }

  useEffect(() => {
    fetchCategory()
    fetchPost()
  }, [])

  useEffect(() => {
    if (post?.gallery) {
      setGallery(
        post.gallery.map((item) => ({
          ...item,
          id: uuidv4(), // Генерируем новый UUID для элемента
          isOriginal: true,
          originalId: item.id, // Сохраняем ID оригинального элемента
        }))
      )
      setOriginalGallery(post.gallery)
    }
  }, [post])

  const handlePostChange = (event) => {
    setEditPost({
      ...post,
      [event.target.name]: event.target.value,
    })
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    const reader = new FileReader()

    setEditPost({
      ...post,
      image: {
        file: event.target.files[0],
        preview: reader.result,
      },
    })
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    if (selectedFile) {
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleGalleryChange = (itemId, event) => {
    const type = event.target.type
    if (type === 'file') {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGallery((prevState) => {
            return prevState.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    image: {file, preview: reader.result},
                    isModified: true, // Помечаем как измененный
                  }
                : item
            )
          })
        }
        reader.readAsDataURL(file)
      } else {
        setGallery((prevState) => {
          return prevState.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  image: null,
                  preview: null,
                  isModified: true, // Помечаем как измененный
                }
              : item
          )
        })
      }
    } else if (type === 'text') {
      const desc = event.target.value
      setGallery((prevState) => {
        return prevState.map((item) => {
          if (item.id === itemId) {
            const originalDesc = originalGallery.find((origItem) => origItem.id === item.originalId)?.description || ''
            return {
              ...item,
              description: desc,
              isModified: item.isOriginal ? desc !== originalDesc : true, // Проверяем изменение для оригинальных элементов
            }
          }
          return item
        })
      })
    }
  }

  const handleEditPost = async (e) => {
    setIsLoading(true)
    e.preventDefault()
    if (!post.title || !post.description || (!post.image && !imagePreview) || !post.category) {
      Toast('error', 'All Fields Are Required To Update A Post')
      setIsLoading(false)
      return
    }

    const formdata = new FormData()
    formdata.append('user_id', userId)
    formdata.append('title', post.title)

    // Отправляем изображение только если оно было изменено
    if (post.image && post.image.file) {
      formdata.append('image', post.image.file)
    }

    formdata.append('description', post.description)
    formdata.append('tags', post.tags)
    formdata.append('category', typeof post.category === 'object' ? post.category.id : post.category)

    // Добавляем даты событий
    if (post.event_start_date !== undefined) {
      formdata.append('event_start_date', post.event_start_date || '')
    }
    if (post.event_end_date !== undefined) {
      formdata.append('event_end_date', post.event_end_date || '')
    }

    try {
      const response = await axiosInstance.patch(`author/dashboard/post-detail/${userId}/${param.id}/`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('Post update response', response.data)
      setIsLoading(false)
      Swal.fire({
        icon: 'success',
        title: 'Post Updated successfully.',
      })
      navigate(`/${post.slug}`)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
      Toast('error', 'Error updating post')
    }
  }

  const handleUpdateGallery = async (e) => {
    setIsGalleryLoading(true)
    e.preventDefault()

    const formdata = new FormData()

    // Отправляем только измененные или новые элементы галереи
    const modifiedGalleryItems = gallery.filter(
      (item) =>
        !item.isOriginal || // новые элементы
        item.isModified || // измененные оригинальные элементы
        (item.image && item.image.file) // элементы с новыми изображениями
    )

    // Добавляем ID элементов для удаления (оригинальные элементы, которые были удалены)
    const galleryIdsToDelete = originalGallery
      .filter((originalItem) => !gallery.find((currentItem) => currentItem.originalId === originalItem.id))
      .map((item) => item.id)

    if (galleryIdsToDelete.length > 0) {
      formdata.append('gallery_ids_to_delete', JSON.stringify(galleryIdsToDelete))
    }

    if (modifiedGalleryItems.length > 0) {
      // Проверяем, что все измененные элементы имеют и изображение, и описание
      const hasInvalidItems = modifiedGalleryItems.some((item) => {
        // Проверяем наличие описания
        if (!item.description) return true

        // Для новых элементов требуем наличие file
        if (!item.isOriginal && (!item.image || !item.image.file)) {
          return true
        }

        // Для существующих элементов проверяем наличие изображения (file или строка URL)
        if (item.isOriginal && !item.image) {
          return true
        }

        return false
      })

      if (hasInvalidItems) {
        Toast('error', 'All gallery items must have both image and description')
        setIsGalleryLoading(false)
        return
      }

      modifiedGalleryItems.forEach((item, index) => {
        if (item.image && item.image.file) {
          // Новое изображение загружено
          formdata.append(`gallery[${index}][image]`, item.image.file)
        } else if (item.image && typeof item.image === 'string') {
          // Для элементов где изменилось только описание, но не изображение
          formdata.append(`gallery[${index}][existing_image_url]`, item.image)
        }
        formdata.append(`gallery[${index}][description]`, item.description)

        // Добавляем ID для обновления существующих элементов
        if (item.isOriginal && item.originalId) {
          formdata.append(`gallery[${index}][id]`, item.originalId)
        }
      })
    }

    console.log('Modified gallery items:', modifiedGalleryItems)
    console.log('Gallery IDs to delete:', galleryIdsToDelete)

    // Логируем что отправляется
    console.log('FormData contents:')
    for (let pair of formdata.entries()) {
      console.log(pair[0], ':', pair[1])
    }

    try {
      const response = await axiosInstance.patch(`author/dashboard/post-gallery/${userId}/${param.id}/`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('Gallery update response', response.data)
      setIsGalleryLoading(false)
      Swal.fire({
        icon: 'success',
        title: 'Gallery Updated successfully.',
      })
      // Перезагружаем пост для обновления галереи
      await fetchPost()
    } catch (error) {
      console.error('Error updating gallery:', error)
      console.error('Error response:', error.response?.data)
      setIsGalleryLoading(false)
      Toast('error', error.response?.data?.message || 'Error updating gallery')
    }
  }
  console.log('gallery', gallery)
  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              <>
                <section className="py-4 py-lg-6 bg-primary rounded-3">
                  <div className="container">
                    <div className="row">
                      <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                        <div className="d-lg-flex align-items-center justify-content-between">
                          <div className="mb-4 mb-lg-0">
                            <h1 className="text-white mb-1">Update Blog Post</h1>
                            <p className="mb-0 text-white lead">Use the article builder below to update your article.</p>
                          </div>
                          <div>
                            <Link to="/posts" className="btn" style={{backgroundColor: 'white'}}>
                              {' '}
                              <i className="fas fa-arrow-left"></i> Back to Posts
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <form className="pb-8 mt-5">
                  <div className="card mb-3">
                    {/* Basic Info Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Basic Information</h4>
                    </div>
                    <div className="text-center card-body">
                      <div>
                        <h3>
                          <label htmlFor="postTHumbnail" className="form-label">
                            Post Picture
                          </label>
                        </h3>
                      </div>

                      <img
                        style={{width: '500px', height: '330px', objectFit: 'cover', borderRadius: '10px'}}
                        className="mb-4"
                        src={imagePreview || post.image || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'}
                        alt=""
                      />
                      <div className="mb-3">
                        <label htmlFor="postTHumbnail" className="form-label"></label>
                        <input onChange={handleFileChange} name="image" id="postTHumbnail" className="form-control" type="file" />
                      </div>
                      <hr />

                      <h3>Post Data</h3>
                      <hr />
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input value={post.title} onChange={handlePostChange} name="title" className="form-control" type="text" placeholder="" />
                        <small>Write a 60 character post title.</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Posts category</label>
                        <select name="category" value={post.category?.id} onChange={handlePostChange} className="form-select">
                          <option value="">-------------</option>
                          {categoryList?.map((c, index) => (
                            <option key={index} value={c?.id}>
                              {c?.title}
                            </option>
                          ))}
                        </select>
                        <small>Help people find your posts by choosing categories that represent your post.</small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Post Description</label>
                        <textarea
                          value={post.description}
                          onChange={handlePostChange}
                          name="description"
                          className="form-control"
                          id=""
                          cols="30"
                          rows="10"
                        ></textarea>
                        <small>A brief summary of your posts.</small>
                      </div>
                      <label className="form-label">Tags</label>
                      <input
                        value={post.tags}
                        onChange={handlePostChange}
                        name="tags"
                        className="form-control"
                        type="text"
                        placeholder="health, medicine, fitness"
                      />
                      <hr />
                      <h5 className="mt-4 mb-3">Event Information (Optional)</h5>
                      <small className="text-muted">Fill in these fields if this post is about an event</small>
                      <div className="mb-3 mt-3">
                        <label className="form-label">Event Start Date</label>
                        <input
                          value={post.event_start_date || ''}
                          onChange={handlePostChange}
                          name="event_start_date"
                          className="form-control"
                          type="date"
                        />
                        <small>The date when the event starts</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Event End Date</label>
                        <input
                          value={post.event_end_date || ''}
                          onChange={handlePostChange}
                          name="event_end_date"
                          className="form-control"
                          type="date"
                        />
                        <small>The date when the event ends (optional, leave blank if it's a one-day event)</small>
                      </div>

                      {/* Post Update Button */}
                      {isLoading === true ? (
                        <button className="btn btn-lg btn-primary w-100 mt-2" disabled>
                          Updating Post... <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      ) : (
                        <button onClick={handleEditPost} className="btn btn-lg btn-success w-100 mt-2" type="button">
                          Update Post <i className="fas fa-check-circle"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="card mb-3">
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Gallery Management</h4>
                    </div>
                    <div className="text-center card-body">
                      {/* Gallery Pictures */}
                      <div>
                        <h3>
                          <label htmlFor="postTHumbnail" className="form-label">
                            Pictures Gallery
                          </label>
                        </h3>
                        {gallery?.map((item, index) => (
                          <div key={item.id} className="row text-dark mb-5">
                            <div className="col-lg-3">
                              {item.image && (
                                <img
                                  src={item.image?.preview || item.image}
                                  alt={`Preview for gallery item ${index + 1}`}
                                  style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: 5}}
                                />
                              )}

                              {!item.image && (
                                <img
                                  src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                                  alt={`Preview for gallery item ${index + 1}`}
                                  style={{width: '150px%', height: '150px', objectFit: 'cover', borderRadius: 5}}
                                />
                              )}
                            </div>
                            <div className="col-lg-6 mb-2">
                              <input id={item.id} type="file" className="form-control" onChange={(e) => handleGalleryChange(item.id, e)} />
                              <input
                                id={`${item.id}-desc`}
                                type="text"
                                className="form-control"
                                onChange={(e) => handleGalleryChange(item.id, e)}
                                value={item.description}
                              />
                            </div>
                            <div className="col-lg-3 mt-2">
                              <button
                                onClick={() => setGallery((prevState) => prevState.filter((galleryItem) => galleryItem.id !== item.id))}
                                type="button"
                                className="btn btn-danger mt-4"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setGallery((prevState) => [...prevState, {id: uuidv4(), image: null, description: '', isOriginal: false}])}
                          className="btn btn-primary mt-2"
                        >
                          <i className="fas fa-plus" /> Add Picture
                        </button>

                        {/* Gallery Update Button */}
                        {isGalleryLoading === true ? (
                          <button className="btn btn-lg btn-warning w-100 mt-4" disabled>
                            Updating Gallery... <i className="fas fa-spinner fa-spin"></i>
                          </button>
                        ) : (
                          <button onClick={handleUpdateGallery} className="btn btn-lg btn-info w-100 mt-4" type="button">
                            Update Gallery <i className="fas fa-images"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default EditPost
