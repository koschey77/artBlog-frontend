import React, {useState, useEffect} from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'

import useUserData from '../../plugin/useUserData'
import Toast from '../../plugin/Toast'
import moment from 'moment'
import useAxios from '../../utils/useAxios'

function Notifications() {
  const axiosInstance = useAxios()
  const [noti, setNoti] = useState([])
  const userId = useUserData()?.user_id

  const fetchNoti = async () => {
    const response = await axiosInstance.get(`author/dashboard/noti-list/${userId}/`)
    setNoti(response.data)
  }

  useEffect(() => {
    fetchNoti()
  }, [])

  const handleMarkNotiAsSeen = async (notiId) => {
    const response = await axiosInstance.post('author/dashboard/noti-mark-seen/', {noti_id: notiId})
    console.log(response.data)
    Toast('success', 'Notification Seen', '')
    fetchNoti()
  }

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              <div className="card mb-4">
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">Notifications</h3>
                    <span>Manage all your notifications from here</span>
                  </div>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {noti?.map((n, index) => (
                      <div key={index}>
                        <li className="list-group-item p-4 shadow rounded-3 mt-4">
                          <div className="col-12">
                            <div className="d-flex justify-content-between position-relative">
                              <div className="d-sm-flex">
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Like' && <i className="fas fa-thumbs-up text-primary fs-1" />}
                                </div>
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Comment' && <i className="bi bi-chat-left-quote-fill text-success fs-1" />}
                                </div>
                                <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                  {n.type === 'Bookmark' && <i className="fas fa-bookmark text-danger fs-1" />}
                                </div>
                                <div className="ms-0 ms-sm-3 mt-2 mt-sm-0">
                                  <h5 className="mb-0">{n.type}</h5>
                                  <p className="mb-0">
                                    {n.type === 'Like' && (
                                      <p>
                                        <b>{n.user.full_name}</b> liked your post <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                      </p>
                                    )}
                                    {n.type === 'Comment' && (
                                      <p>
                                        You have a new comment on <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                        <br /> from <b>{n.user.full_name}</b>
                                      </p>
                                    )}
                                    {n.type === 'Bookmark' && (
                                      <p>
                                        <b>{n.user.full_name}</b> bookmarked your post <b>{n.post?.title?.slice(0, 30) + '...'}</b>
                                      </p>
                                    )}
                                  </p>
                                  <span className="small">at {moment(n.date).format('HH:mm / DD MMM, YYYY')}</span>
                                  <br />
                                  <button onClick={() => handleMarkNotiAsSeen(n.id)} className="btn btn-danger fs-5 mt-2">
                                    <i className="fas fa-check-circle"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </div>
                    ))}
                    {noti?.length < 1 && <p>No notifications yet</p>}
                  </ul>
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

export default Notifications
