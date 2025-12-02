import axios from 'axios'
import {getRefreshToken, isAccessTokenExpired, setAuthUser} from './auth' // Import authentication-related functions
import {API_BASE_URL} from './constants' // Import the base API URL
import Cookies from 'js-cookie' // Import the 'js-cookie' library for managing cookies
import useUserData from '../plugin/useUserData'

// Define a custom Axios instance creator function
const useAxios = () => {
  // Retrieve the access and refresh tokens from cookies
  const accessToken = Cookies.get('access_token')
  const refreshToken = Cookies.get('refresh_token')
  const userData = useUserData()

  console.log('Пользователь ', userData)
  console.log('Access token:', !!accessToken, 'Refresh token:', !!refreshToken)

  // Create base headers object
  const headers = {}

  // Only add Authorization header if we have both tokens and user data
  if (accessToken && refreshToken && userData) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  // Create an Axios instance with base URL and conditional auth header
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers,
  })

  // Add an interceptor to the Axios instance
  axiosInstance.interceptors.request.use(async (req) => {
    // Get fresh token data for each request
    const currentAccessToken = Cookies.get('access_token')
    const currentRefreshToken = Cookies.get('refresh_token')
    const currentUserData = useUserData()

    // If we don't have user data or tokens, skip auth
    if (!currentUserData || !currentAccessToken || !currentRefreshToken) {
      // Remove auth header if no valid authentication
      delete req.headers.Authorization
      return req
    }

    // Check if the access token is expired
    if (!isAccessTokenExpired(currentAccessToken)) {
      // Update header with current valid token
      req.headers.Authorization = `Bearer ${currentAccessToken}`
      return req // If not expired, return the original request
    }

    try {
      // If the access token is expired, refresh it
      const response = await getRefreshToken(currentRefreshToken)
      // Update the application with the new access and refresh tokens
      setAuthUser(response.access, response.refresh)

      // Update the request's 'Authorization' header with the new access token
      req.headers.Authorization = `Bearer ${response.access}`
    } catch (error) {
      // If refresh fails, remove auth header
      console.warn('Token refresh failed:', error)
      delete req.headers.Authorization
    }

    return req // Return the updated request
  })

  return axiosInstance // Return the custom Axios instance
}

export default useAxios // Export the custom Axios instance creator function
