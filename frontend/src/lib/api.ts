import axios from 'axios'

import {
  getAccessToken,
  setAccessToken,
  clearAuth,
  getTenantSlug
} from '@/src/lib/auth'

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    'Content-Type': 'application/json'
  },

  // Required so the browser sends the
  // HTTP-only refresh token cookie on
  // every request automatically
  withCredentials: true
})

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
//
// Attaches the in-memory access token
// and tenant slug to every request
// ─────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`
  }

  const slug = getTenantSlug()

  if (slug) {
    config.headers['x-tenant-slug'] = slug
  }

  return config
})

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
//
// On 401: silently refresh the access token
// using the HTTP-only refresh cookie, then
// retry the original request once.
//
// On refresh failure: clear auth state and
// redirect to login.
// ─────────────────────────────────────────────

// Track an in-flight refresh so parallel
// requests don't each trigger their own refresh
let _refreshPromise: Promise<string> | null =
  null

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        // If a refresh is already in flight,
        // wait for it instead of firing again
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post<{
              data: { accessToken: string }
            }>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
              {},
              {
                // HTTP-only refresh cookie sent
                // automatically by the browser
                withCredentials: true,
                headers: {
                  'x-tenant-slug':
                    getTenantSlug() || ''
                }
              }
            )
            .then((res) => {
              const { accessToken } =
                res.data.data

              setAccessToken(accessToken)

              return accessToken
            })
            .finally(() => {
              // reset so next expiry triggers
              // a fresh refresh
              _refreshPromise = null
            })
        }

        const accessToken =
          await _refreshPromise

        // retry original request with new token
        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        // refresh token is also expired/invalid
        // clear all auth state
        clearAuth()

        // call backend to clear HTTP-only cookie
        // fire-and-forget — we're logging out anyway
        axios
          .post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
            {},
            { withCredentials: true }
          )
          .catch(() => {})

        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// SILENT REFRESH
//
// Call this once on app mount (in a top-level
// layout or AuthProvider) to restore the
// in-memory access token after a page refresh,
// using the HTTP-only cookie.
//
// Usage:
//   useEffect(() => { silentRefresh() }, [])
// ─────────────────────────────────────────────

export const silentRefresh =
  async (): Promise<boolean> => {
    try {
      const response = await axios.post<{
        data: { accessToken: string }
      }>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            'x-tenant-slug':
              getTenantSlug() || ''
          }
        }
      )

      setAccessToken(
        response.data.data.accessToken
      )

      return true
    } catch {
      // No valid refresh token — user must log in
      return false
    }
  }

// ─────────────────────────────────────────────
// LOGOUT HELPER
//
// Always calls the backend first to invalidate
// the Redis refresh token entry, then clears
// local state. This ensures a stolen refresh
// token cookie cannot be reused.
// ─────────────────────────────────────────────

export const logout = async () => {
  try {
    await api.post('/api/auth/logout')
  } catch {
    // proceed with local cleanup regardless
  } finally {
    clearAuth()
    window.location.href = '/login'
  }
}

export default api