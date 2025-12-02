import React, {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
import {Link} from 'react-router-dom'

import useUserData from '../../plugin/useUserData'
import moment from 'moment'
import Toast from '../../plugin/Toast'
import useAxios from '../../utils/useAxios'
import {SERVER_URL} from '../../utils/constants'
import getAvatarUrl from '../../utils/avatarHelper'

function Comments() {
  const [comments, setComments] = useState([])
  const [reply, setReply] = useState('')
  const userId = useUserData()?.user_id
  const axiosInstance = useAxios()

  const fetchComment = async () => {
    const response = await axiosInstance.get(`author/dashboard/comment-list/${userId}/`)
    setComments(response.data)
    console.log('comments', response.data)
  }

  useEffect(() => {
    fetchComment()
  }, [])

  const handleSubmitReply = async (commentId) => {
    try {
      const response = await axiosInstance.post(`author/dashboard/reply-comment/`, {
        comment_id: commentId,
        reply: reply,
      })
      console.log(response.data)
      fetchComment()
      Toast('success', 'Reply Sent.', '')
      setReply('')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              {/* Card */}
              <div className="card mb-4">
                {/* Card header */}
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Comments</h3>
                    <span>You have full control to manage your own comments.</span>
                  </div>
                </div>
                {/* Card body */}
                <div className="card-body">
                  {/* List group */}
                  <ul className="list-group list-group-flush">
                    {/* List group item */}
                    {comments?.map((c, index) => (
                      <li key={index} className="list-group-item p-4 shadow rounded-3 mb-3">
                        <div className="d-flex">
                          <img
                            src={getAvatarUrl(c.commentator_image)}
                            alt="avatar"
                            className="rounded-circle"
                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                            onError={(e) => {
                              e.target.src = '/default-avatar.png'
                            }}
                          />
                          <div className="ms-3 mt-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h4 className="mb-0">{c.name}</h4>
                                <i>At</i> {moment(c.date).format('HH:mm / DD MMM, YYYY')}
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="mt-2">
                                <span className="fw-bold me-2">
                                  Comment <i className="fas fa-arrow-right"></i>
                                </span>
                                {c.comment}
                              </p>
                              <p className="mt-2 d-flex">
                                <span className="fw-bold me-2">
                                  Response <i className="fas fa-arrow-right"></i>
                                </span>
                                {c.reply || <span className="text-danger">No Reply</span>}
                              </p>
                              <p>
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapseExample${c.id}`}
                                  aria-expanded="false"
                                  aria-controls={`collapseExample${c.id}`}
                                >
                                  Send Response
                                </button>
                              </p>
                              <div className="collapse" id={`collapseExample${c.id.toString()}`}>
                                <div className="card card-body">
                                  <div className="mb-3">
                                    <label htmlFor="exampleInputEmail1" className="form-label">
                                      Write Response
                                    </label>
                                    <textarea
                                      onChange={(e) => setReply(e.target.value)}
                                      value={reply}
                                      name=""
                                      id=""
                                      cols="30"
                                      className="form-control"
                                      rows="4"
                                    ></textarea>
                                  </div>
                                  <button onClick={() => handleSubmitReply(c.id)} type="submit" className="btn btn-primary">
                                    Send Response <i className="fas fa-paper-plane"> </i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Comments
