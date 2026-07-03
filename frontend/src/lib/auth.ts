import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

// ─────────────────────────────────────────────
// ACCESS TOKEN — stored in MEMORY only
//
// Why not a cookie?
// js-cookie / document.cookie is readable
// by any JS on the page (XSS risk).
//
// Storing in memory means the token is gone
// on page refresh — that's intentional.
// A silent refresh call on app mount (using
// the HTTP-only refresh token cookie) will
// restore it automatically.
// ─────────────────────────────────────────────

let _accessToken: string | null = null

export const setAccessToken = (
  token: string
) => {
  _accessToken = token
}

export const getAccessToken = () =>
  _accessToken

export const clearAccessToken = () => {
  _accessToken = null
}

// ─────────────────────────────────────────────
// TENANT SLUG
// Not sensitive — safe to persist in a cookie.
// 30-day expiry, strict sameSite.
// ─────────────────────────────────────────────

const TENANT_SLUG_EXPIRES = 30

export const setTenantSlug = (slug: string) => {
  const isProd = process.env.NODE_ENV === 'production'
  Cookies.set('tenantSlug', slug, {
    expires: 30,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  })
}

export const getTenantSlug = () =>
  Cookies.get('tenantSlug')

export const clearTenantSlug = () =>
  Cookies.remove('tenantSlug')

// ─────────────────────────────────────────────
// CLEAR AUTH
//
// Clears memory token + tenant slug cookie.
// The HTTP-only refresh token cookie is cleared
// by the backend /api/auth/logout endpoint.
// ─────────────────────────────────────────────

export const clearAuth = () => {
  clearAccessToken()
  clearTenantSlug()
}

// ─────────────────────────────────────────────
// LOGIN CHECK
//
// Decodes the in-memory access token and checks
// the `exp` claim — not just cookie presence.
// ─────────────────────────────────────────────

export const isLoggedIn = (): boolean => {
  const token = getAccessToken()

  if (!token) return false

  try {
    const { exp } = jwtDecode<{
      exp: number
    }>(token)

    // exp is in seconds, Date.now() in ms
    return Date.now() < exp * 1000
  } catch {
    return false
  }
}