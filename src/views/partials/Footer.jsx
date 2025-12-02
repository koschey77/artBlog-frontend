import React from 'react'
import {Link} from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-light border-top mt-5">
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center mb-4">
            <Link className="text-decoration-none d-inline-flex align-items-center mb-3" to="/">
              <i className="bi bi-palette-fill fs-1 text-primary me-3"></i>
              <span className="fs-2 fw-bold text-primary">Art Blog</span>
            </Link>
            <p className="text-muted fst-italic">Where Art Comes to Life</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="fw-bold text-uppercase mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-house-door me-2"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/authors/" className="text-muted text-decoration-none">
                  <i className="bi bi-people me-2"></i>Authors
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about/" className="text-muted text-decoration-none">
                  <i className="bi bi-info-circle me-2"></i>About
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact/" className="text-muted text-decoration-none">
                  <i className="bi bi-envelope me-2"></i>Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="fw-bold text-uppercase mb-3">Categories</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-brush me-2"></i>Visual Arts
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-music-note me-2"></i>Performing Arts
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-film me-2"></i>Cinema
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  <i className="bi bi-calendar-event me-2"></i>Events
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold text-uppercase mb-3">Follow Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted fs-4">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-muted fs-4">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-muted fs-4">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-muted fs-4">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row">
          <div className="col-12 text-center">
            <p className="text-muted mb-0">
              <small>© 2025 Art Blog. All rights reserved. Discover the world through art.</small>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
