// src/utils/analytics.js
import ReactGA from 'react-ga4'

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID
const isProduction = import.meta.env.NODE_ENV === 'production'

export const initGA = () => {
  console.log('Initializing GA with ID:', TRACKING_ID, 'Production mode:', isProduction)

  if (TRACKING_ID) {
    ReactGA.initialize(TRACKING_ID, {
      debug: !isProduction, // Отладка включена в dev режиме
    })
    console.log('Google Analytics initialized successfully with ID:', TRACKING_ID)
  } else {
    console.log('Google Analytics not initialized - missing TRACKING_ID')
  }
}

// Отслеживание просмотров страниц
export const logPageView = (path) => {
  if (TRACKING_ID) {
    console.log('Tracking pageview:', path, document.title)
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: document.title,
    })
  } else {
    console.log('Pageview not tracked - missing TRACKING_ID')
  }
}

// Отслеживание событий
export const logEvent = (category, action, label = '', value = 0) => {
  if (TRACKING_ID) {
    console.log('Tracking event:', {category, action, label, value})
    ReactGA.event({
      category,
      action,
      label,
      value,
    })
  } else {
    console.log('Event not tracked - missing TRACKING_ID')
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
