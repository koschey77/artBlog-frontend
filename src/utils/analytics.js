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

// Установка пользовательского ID и данных
export const setUserData = (user) => {
  if (TRACKING_ID && user) {
    console.log('Setting user data:', { 
      user_id: user.id, 
      email: user.email, 
      username: user.username 
    })
    
    // Установка User ID для отслеживания между сессиями
    ReactGA.set({ userId: user.id })
    
    // Установка пользовательских параметров
    ReactGA.gtag('config', TRACKING_ID, {
      user_id: user.id,
      custom_map: {
        custom_parameter_1: 'user_email',
        custom_parameter_2: 'user_name'
      }
    })
    
    // Отправка пользовательских данных
    ReactGA.event('user_data', {
      user_email: user.email,
      user_name: user.username || user.first_name,
      user_type: 'registered'
    })
  }
}

// Очистка пользовательских данных при выходе
export const clearUserData = () => {
  if (TRACKING_ID) {
    console.log('Clearing user data')
    ReactGA.set({ userId: null })
    ReactGA.event('user_data', {
      user_type: 'anonymous'
    })
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

// Отслеживание событий с дополнительными параметрами
export const logEvent = (category, action, label = '', value = 0, customParams = {}) => {
  if (TRACKING_ID) {
    console.log('Tracking event:', {category, action, label, value, ...customParams})
    ReactGA.event({
      category,
      action,
      label,
      value,
      ...customParams
    })
  } else {
    console.log('Event not tracked - missing TRACKING_ID')
  }
}

// Специфические события для ArtBlog с информацией о пользователе
export const trackPostView = (postId, postTitle, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Post', 'View', postTitle, postId, userParams)
}

export const trackPostLike = (postId, postTitle, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Post', 'Like', postTitle, postId, userParams)
}

export const trackPostComment = (postId, postTitle, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Post', 'Comment', postTitle, postId, userParams)
}

export const trackPostBookmark = (postId, postTitle, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Post', 'Bookmark', postTitle, postId, userParams)
}

export const trackUserRegistration = (user) => {
  if (user) {
    const userParams = {
      user_email: user.email,
      user_name: user.username || user.first_name,
      user_id: user.id,
      registration_method: 'email'
    }
    logEvent('User', 'Registration', 'New User', user.id, userParams)
    
    // Устанавливаем пользовательские данные после регистрации
    setUserData(user)
  }
}

export const trackUserLogin = (user) => {
  if (user) {
    const userParams = {
      user_email: user.email,
      user_name: user.username || user.first_name,
      user_id: user.id,
      login_method: 'email'
    }
    logEvent('User', 'Login', 'User Login', user.id, userParams)
    
    // Устанавливаем пользовательские данные после входа
    setUserData(user)
  }
}

export const trackUserLogout = () => {
  logEvent('User', 'Logout', 'User Logout')
  
  // Очищаем пользовательские данные при выходе
  clearUserData()
}

export const trackSearch = (searchTerm, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Search', 'Query', searchTerm, 0, userParams)
}

export const trackCategoryView = (categoryName, user = null) => {
  const userParams = user ? {
    user_email: user.email,
    user_name: user.username || user.first_name,
    user_id: user.id
  } : { user_type: 'anonymous' }
  
  logEvent('Category', 'View', categoryName, 0, userParams)
}
