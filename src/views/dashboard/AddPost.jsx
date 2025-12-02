import React, {useEffect, useState} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link, useNavigate} from 'react-router-dom'

import useUserData from '../../plugin/useUserData'
import Toast from '../../plugin/Toast'
import Swal from 'sweetalert2'
import useAxios from '../../utils/useAxios'

function AddPost() {
  const axiosInstance = useAxios()
  const userId = useUserData()?.user_id
  const [post, setCreatePost] = useState({
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
  const navigate = useNavigate()
  const [gallery, setGallery] = useState([{image: null, description: ''}])

  const fetchCategory = async () => {
    const response = await axiosInstance.get(`post/category/list/`)
    setCategoryList(response.data)
  }
  useEffect(() => {
    fetchCategory()
  }, [])

  const handleCreatePostChange = (event) => {
    setCreatePost({
      ...post,
      [event.target.name]: event.target.value,
    })
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    const reader = new FileReader()
    setCreatePost({
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

  const handleGalleryChange = (index, event) => {
    const type = event.target.type
    if (type === 'file') {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGallery((prevState) => {
            const newState = [...prevState]
            newState[index].image = {file, preview: reader.result}
            return newState
          })
        }
        reader.readAsDataURL(file)
      } else {
        // Handle the case when no file is selected
        setGallery((prevState) => {
          const newState = [...prevState]
          newState[index].image = null // Set image to null
          newState[index].preview = null // Optionally set preview to null
          return newState
        })
      }
    } else if (type === 'text') {
      const descValue = event.target.value
      setGallery((prevState) => {
        const newState = [...prevState]
        newState[index].description = descValue
        return newState
      })
    }
  }

  console.log('Галерея: ', gallery)

  const handleCreatePost = async (e) => {
    setIsLoading(true)
    e.preventDefault()

    // Валидация основных полей
    if (!post.title || !post.description || !post.image || !post.category) {
      Toast('error', 'All Fields Are Required To Create A Post')
      setIsLoading(false)
      return
    }

    // Проверка галереи - все элементы должны быть полностью заполнены или пустые
    const validGalleryItems = gallery.filter((item) => item.image && item.description)
    const hasIncompleteItems = gallery.some((item) => (item.image && !item.description) || (!item.image && item.description))

    if (hasIncompleteItems) {
      Toast('error', 'All gallery items must have both image and description')
      setIsLoading(false)
      return
    }

    try {
      // Шаг 1: Создаем пост без галереи
      const formdata = new FormData()
      formdata.append('user_id', userId)
      formdata.append('title', post.title)
      formdata.append('image', post.image.file)
      formdata.append('description', post.description)
      formdata.append('tags', post.tags)
      formdata.append('category', typeof post.category === 'object' ? post.category.id : post.category)
      formdata.append('profile', userId)

      // Добавляем даты событий (если они указаны)
      if (post.event_start_date) {
        formdata.append('event_start_date', post.event_start_date)
      }
      if (post.event_end_date) {
        formdata.append('event_end_date', post.event_end_date)
      }

      console.log('Creating post with data:', {
        title: post.title,
        description: post.description,
      })

      const response = await axiosInstance.post('author/dashboard/post-create/', formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Post created successfully:', response.data)
      const createdPostId = response.data.id

      // Шаг 2: Если есть валидные элементы галереи, добавляем их отдельным запросом
      if (validGalleryItems.length > 0) {
        console.log('Adding gallery items:', validGalleryItems.length)
        const galleryFormData = new FormData()

        validGalleryItems.forEach((item, index) => {
          galleryFormData.append(`gallery[${index}][image]`, item.image.file)
          galleryFormData.append(`gallery[${index}][description]`, item.description)
        })

        try {
          await axiosInstance.patch(`author/dashboard/post-gallery/${userId}/${createdPostId}/`, galleryFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          console.log('Gallery added successfully')
        } catch (galleryError) {
          console.error('Error adding gallery:', galleryError)
          Toast('warning', 'Post created but gallery upload failed. You can add gallery items by editing the post.')
        }
      }

      setIsLoading(false)

      await Swal.fire({
        icon: 'success',
        title: 'Post created successfully!',
        text: `Your post "${post.title}" has been published.`,
        confirmButtonText: 'View Posts',
      })

      navigate('/posts/')
    } catch (error) {
      console.error('Error creating post:', error)
      setIsLoading(false)
      Toast('error', error.response?.data?.message || 'Error creating post')
    }
  }

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
                            <h1 className="text-white mb-1">Create Blog Post</h1>
                            <p className="mb-0 text-white lead">Use the article builder below to write your article.</p>
                          </div>
                          <div>
                            <Link to="/posts/" className="btn" style={{backgroundColor: 'white'}}>
                              {' '}
                              <i className="fas fa-arrow-left"></i> Back to Posts
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <form onSubmit={handleCreatePost} className="pb-8 mt-5">
                  <div className="card mb-3">
                    {/* Basic Info Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Basic Information</h4>
                    </div>
                    <div className="card-body">
                      <h5>
                        <label htmlFor="postTHumbnail" className="form-label">
                          Post Picture
                        </label>
                      </h5>
                      <img
                        style={{width: '250px', height: '250px', objectFit: 'cover', borderRadius: '10px'}}
                        className="mb-4"
                        src={imagePreview || 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'}
                        alt=""
                      />
                      <div className="mb-3">
                        <label htmlFor="postTHumbnail" className="form-label"></label>
                        <input onChange={handleFileChange} name="image" id="postTHumbnail" className="form-control" type="file" />
                      </div>
                      <hr />

                      {/* Gallery Pictures */}
                      <div>
                        <h5>
                          <label htmlFor="postTHumbnail" className="form-label">
                            Gallery Pictures
                          </label>
                        </h5>
                        {gallery.map((item, index) => (
                          <div key={index} className="row text-dark mb-5">
                            <div className="col-lg-3">
                              {item.image && (
                                <img
                                  src={item.image.preview}
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
                              <input
                                id={`gallery-file-${index}`}
                                type="file"
                                className="form-control mb-2"
                                onChange={(e) => handleGalleryChange(index, e)}
                              />
                              <input
                                id={`gallery-desc-${index}`}
                                type="text"
                                className="form-control"
                                value={item.description || ''}
                                onChange={(e) => handleGalleryChange(index, e)}
                                placeholder="Picture Notes"
                              />
                            </div>
                            <div className="col-lg-3 mt-2">
                              <button
                                onClick={() => setGallery((prevState) => prevState.filter((_, i) => i !== index))}
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
                          onClick={() => setGallery((prevState) => [...prevState, {image: null, description: ''}])}
                          className="btn btn-primary mt-2"
                        >
                          <i className="fas fa-plus" /> Add Picture
                        </button>
                      </div>
                      <hr />
                      {/* Gallery Pictures */}

                      <div className="mb-3">
                        <label className="form-label">Post Title</label>
                        <input onChange={handleCreatePostChange} name="title" className="form-control" type="text" placeholder="" />
                        <small>Write a 60 character post title.</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Post category (Required)</label>
                        <select name="category" onChange={handleCreatePostChange} className="form-select">
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
                        <textarea onChange={handleCreatePostChange} name="description" className="form-control" id="" cols="30" rows="10"></textarea>
                        <small>A brief summary of your posts.</small>
                      </div>
                      <label className="form-label">Tags</label>
                      <input
                        onChange={handleCreatePostChange}
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
                          onChange={handleCreatePostChange}
                          name="event_start_date"
                          className="form-control"
                          type="date"
                          value={post.event_start_date}
                        />
                        <small>The date when the event starts</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Event End Date</label>
                        <input
                          onChange={handleCreatePostChange}
                          name="event_end_date"
                          className="form-control"
                          type="date"
                          value={post.event_end_date}
                        />
                        <small>The date when the event ends (optional, leave blank if it's a one-day event)</small>
                      </div>
                    </div>
                  </div>
                  {isLoading === true ? (
                    <button className="btn btn-lg btn-secondary w-100 mt-2" disabled>
                      Creating Post... <i className="fas fa-spinner fa-spin"></i>
                    </button>
                  ) : (
                    <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                      Create Post <i className="fas fa-check-circle"></i>
                    </button>
                  )}
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

export default AddPost
