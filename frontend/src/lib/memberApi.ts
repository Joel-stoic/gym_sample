import axios from 'axios'
import Cookies from 'js-cookie'

const memberApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

memberApi.interceptors.request.use((config) => {
  const token = Cookies.get('memberAccessToken')
  const slug  = Cookies.get('memberTenantSlug') // ← rename

  if (token) config.headers.Authorization = `Bearer ${token}`
  if (slug)  config.headers['x-tenant-slug'] = slug

  return config
})

memberApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('memberAccessToken')
      Cookies.remove('memberData')
      // Cookies.remove('tenantSlug')
      Cookies.remove('memberTenantSlug')
      window.location.href = '/member/login'
    }
    return Promise.reject(error)
  }
)

export default memberApi