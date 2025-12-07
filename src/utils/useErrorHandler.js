import {useCallback} from 'react'
import Toast from '../plugin/Toast'

/**
 * Хук для стандартизированной обработки ошибок API
 */
export const useErrorHandler = () => {
  const handleApiError = useCallback((error, defaultMessage = 'Something went wrong') => {
    console.error('API Error:', error)

    if (error.response) {
      // Сервер ответил с ошибкой
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error

      switch (status) {
        case 401:
          Toast('error', 'Authentication Required', 'Please login again')
          break
        case 403:
          Toast('error', 'Access Denied', 'You do not have permission for this action')
          break
        case 404:
          Toast('error', 'Not Found', 'The requested resource was not found')
          break
        case 429:
          Toast('error', 'Too Many Requests', 'Please wait a moment before trying again')
          break
        case 500:
          Toast('error', 'Server Error', 'Please try again later')
          break
        default:
          Toast('error', 'Error', message || defaultMessage)
      }
    } else if (error.request) {
      // Запрос был отправлен но ответа не получено
      Toast('error', 'Network Error', 'Please check your internet connection')
    } else {
      // Ошибка при настройке запроса
      Toast('error', 'Error', defaultMessage)
    }
  }, [])

  return {handleApiError}
}

export default useErrorHandler
