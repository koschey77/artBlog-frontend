import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import useAxios from '../../utils/useAxios'
import usePagination from '../../utils/usePagination'
import PaginationComponent from '../../components/PaginationComponent'

function EventsList() {
  const [events, setEvents] = useState([])
  const axiosInstance = useAxios()

  // Пагинация для событий
  const pagination = usePagination(6) // меньший размер страницы для событий

  // Размеры страниц для событий
  const pageSizeOptions = [6, 12, 24]

  const fetchEvents = async () => {
    const params = pagination.getPaginationParams()
    const response = await axiosInstance.get('post/events/', {params})

    // Обработать ответ с пагинацией
    const eventsList = pagination.handlePaginationResponse(response.data)
    setEvents(eventsList)
  }

  useEffect(() => {
    fetchEvents()
  }, [pagination.currentPage, pagination.pageSize])

  const getStatusBadge = (event) => {
    switch (event.event_status) {
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

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col">
          <h2>Events</h2>
        </div>
      </div>

      <div className="row">
        {events?.map((event, index) => (
          <div className="col-sm-6 col-lg-4" key={index}>
            <div className="card mb-3">
              <div className="position-relative">
                <Link to={`/${event.slug}/`}>
                  <img src={event.image} style={{width: '100%', height: '200px', objectFit: 'cover'}} alt={event.title} />
                </Link>
                <span
                  className={`position-absolute top-0 start-0 badge ${getStatusBadge(event).className} m-2 px-2 py-1 rounded-pill`}
                  style={{opacity: 0.8}}
                >
                  <small>{getStatusBadge(event).text}</small>
                </span>
              </div>

              <div className="card-body">
                <h5 className="card-title">
                  <Link to={`/${event.slug}`} className="btn-link text-reset fw-bold text-decoration-none">
                    {event.title?.slice(0, 40)}...
                  </Link>
                </h5>

                {event.event_start_date && (
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="fas fa-calendar-alt me-1"></i>
                      <span className="text-dark">
                        {moment(event.event_start_date).format('DD MMM, YYYY')}
                        {event.event_end_date && <> - {moment(event.event_end_date).format('DD MMM, YYYY')}</>}
                      </span>
                    </small>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    <i className="fas fa-eye"></i> {event.view} Views
                  </small>
                  <small className="text-muted">
                    <i className="fas fa-thumbs-up"></i> {event.likes?.length || 0}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Компонент пагинации */}
      <PaginationComponent pagination={pagination} showPageSizeSelector={true} pageSizeOptions={pageSizeOptions} />
    </div>
  )
}

export default EventsList
