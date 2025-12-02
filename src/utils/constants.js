import UserData from '../plugin/useUserData'

// Production URLs for Railway and Netlify deployment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d3a68.up.railway.app/api/v1/'
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://web-production-d3a68.up.railway.app'
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'
export const PAYPAL_CLIENT_ID = 'test'
export const CURRENCY_SIGN = '$'
export const userId = UserData()?.user_id
export const teacherId = UserData()?.teacher_id
console.log(teacherId)
