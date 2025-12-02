import React, {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link} from 'react-router-dom'
import useAxios from '../../utils/useAxios'
import useUserData from '../../plugin/useUserData'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'
import moment from 'moment'

function Posts() {
  const axiosInstance = useAxios()
  const [posts, setPosts] = useState([])
  const userId = useUserData()?.user_id

  // Пагинация для постов
  const pagination = usePagination(6) // 10 постов на странице для dashboard

  // Размеры страниц для dashboard
  const pageSizeOptions = [6, 12, 24, 48]

  const fetchPosts = async () => {
    const params = pagination.getPaginationParams()
    const response = await axiosInstance.get(`author/dashboard/post-list/${userId}/`, {params})

    // Обработать ответ с пагинацией
    const postsList = pagination.handlePaginationResponse(response.data)
    setPosts(postsList)
  }

  useEffect(() => {
    fetchPosts()
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
                      All Blog Posts
                      {pagination.totalItems > 0 && <span className="badge bg-primary bg-opacity-10 text-primary">{pagination.totalItems}</span>}
                    </h5>
                    <a href="/add-post/" className="btn btn-sm btn-primary mb-0">
                      Add New <i className="fas fa-plus"></i>
                    </a>
                  </div>
                </div>
                <div className="card-body">
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
                                <Link to={`/${p.slug}/`} className="text-dark text-decoration-none">
                                  {p?.title}
                                </Link>
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
                                <Link
                                  to={`/edit-post/${p.id}/`}
                                  className="btn btn-primary btn-round mb-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square" />
                                </Link>
                                <button
                                  onClick={async () => {
                                    await axiosInstance.delete(`author/dashboard/post-detail/${userId}/${p.id}/`)
                                    fetchPosts()
                                  }}
                                  className="btn-round mb-0 btn btn-danger"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Delete"
                                >
                                  <i className="bi bi-trash" />
                                </button>
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
                    showPageSizeSelector={true}
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

export default Posts
