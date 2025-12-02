import React from 'react'
import {Link} from 'react-router-dom'
import {useAuthStore} from '../../store/auth'

function Header() {
  const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user])

  return (
    <header
      className="border-bottom shadow-sm fixed-top"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 218, 185, 0.3) 0%, rgba(255, 182, 193, 0.3) 20%, rgba(221, 160, 221, 0.3) 40%, rgba(173, 216, 230, 0.3) 60%, rgba(144, 238, 144, 0.3) 80%, rgba(255, 255, 224, 0.3) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-light" style={{minHeight: '80px'}}>
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
            <i className="bi bi-palette-fill fs-3 me-2"></i>
            <span className="fs-4">Art Blog</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-3">
              <li className="nav-item">
                <Link className="nav-link" to="/" style={{color: '#2E8B97', fontSize: '1.05rem'}}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/authors/" style={{color: '#2E8B97', fontSize: '1.05rem'}}>
                  Authors
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about/" style={{color: '#2E8B97', fontSize: '1.05rem'}}>
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact/" style={{color: '#2E8B97', fontSize: '1.05rem'}}>
                  Contact
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              {isLoggedIn() && (
                <div className="dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="pagesMenu"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Management
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                    <li>
                      <Link className="dropdown-item" to="/dashboard/">
                        <i className="fas fa-user me-2"></i> Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/posts/">
                        <i className="bi bi-grid-fill me-2"></i> Posts
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/bookmarks/">
                        <i className="bi bi-bookmark-fill me-2"></i> Bookmarks
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/add-post/">
                        <i className="fas fa-plus-circle me-2"></i> Add Post
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/comments/">
                        <i className="bi bi-chat-left-quote-fill me-2"></i> Comments
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/notifications/">
                        <i className="fas fa-bell me-2"></i> Notifications
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile/">
                        <i className="fas fa-user-gear me-2"></i> Profile
                      </Link>
                    </li>
                  </ul>
                </div>
              )}

              {isLoggedIn() ? (
                <>
                  <Link to={'/dashboard/'} className="btn btn-primary btn-sm">
                    <i className="bi bi-grid-fill me-1"></i> Dashboard
                  </Link>
                  <Link to={'/logout/'} className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-sign-out-alt me-1"></i> Logout
                  </Link>
                  <Link className="nav-link d-none d-lg-block ms-2 text-muted" to="/profile/">
                    <small>Hello, {user().username}</small>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={'/register/'} className="btn btn-primary btn-sm">
                    <i className="fas fa-user-plus me-1"></i> Register
                  </Link>
                  <Link to={'/login/'} className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
