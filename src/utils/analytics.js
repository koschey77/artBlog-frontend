// src/utils/analytics.js
import ReactGA from 'react-ga4'

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID
const isProduction = import.meta.env.NODE_ENV === 'production'

export const initGA = () => {
  if (TRACKING_ID && isProduction) {
    ReactGA.initialize(TRACKING_ID, {
      debug: false, // Включите для отладки в dev режиме
    })
    console.log('Google Analytics initialized')
  } else {
    console.log('Google Analytics not initialized (dev mode or missing ID)')
  }
}

// Отслеживание просмотров страниц
export const logPageView = (path) => {
  if (TRACKING_ID && isProduction) {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: document.title,
    })
  }
}

// Отслеживание событий
export const logEvent = (category, action, label = '', value = 0) => {
  if (TRACKING_ID && isProduction) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    })
  }
}

// Специфические события для ArtBlog
export const trackPostView = (postId, postTitle) => {
  logEvent('Post', 'View', postTitle, postId)
}

export const trackPostLike = (postId, postTitle) => {
  logEvent('Post', 'Like', postTitle, postId)
}

export const trackPostComment = (postId, postTitle) => {
  logEvent('Post', 'Comment', postTitle, postId)
}

export const trackPostBookmark = (postId, postTitle) => {
  logEvent('Post', 'Bookmark', postTitle, postId)
}

export const trackUserRegistration = () => {
  logEvent('User', 'Registration', 'New User')
}

export const trackUserLogin = () => {
  logEvent('User', 'Login', 'User Login')
}

export const trackSearch = (searchTerm) => {
  logEvent('Search', 'Query', searchTerm)
}

export const trackCategoryView = (categoryName) => {
  logEvent('Category', 'View', categoryName)
}
