import Cookies from 'js-cookie'

// Strip scheme / path / port so a "NEXT_PUBLIC_DOMAIN=localhost:3000" mistake
// cannot produce an invalid Domain= attribute the browser rejects silently.
function normalizeHost(raw?: string): string {
  if (!raw) return ''
  let v = raw.trim().toLowerCase()
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, '') // scheme
  v = v.split('/')[0]                          // path
  v = v.split(':')[0]                          // port
  return v
}

// NEXT_PUBLIC_DOMAIN controls cookie scoping:
//   unset / empty  → host-only cookie. "localhost" cookies are NOT sent
//                    to app.localhost.  ✅ what you want in local dev.
//   set to a host  → cookie scoped to ".{host}", shared across every
//                    subdomain (needed in prod, e.g. ".rovno.dev").
//
// Browsers reject Domain=.localhost (localhost is not a registrable domain),
// so even if someone sets NEXT_PUBLIC_DOMAIN=localhost we drop it and fall
// back to a host-only cookie — which is the correct dev behaviour anyway.
const ROOT_RAW = normalizeHost(process.env.NEXT_PUBLIC_DOMAIN)
const IS_LOCAL = ROOT_RAW === 'localhost' || ROOT_RAW.endsWith('.localhost')
const COOKIE_DOMAIN = ROOT_RAW && !IS_LOCAL ? '.' + ROOT_RAW : undefined

const isHttps = process.env.NEXT_PUBLIC_HTTP_PROTOCOL === 'https'

export const safeCookieStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null
        try {
            return Cookies.get(key) || null
        } catch (e) {
            console.warn('Cookie недоступны (чтение)', e)
            return null
        }
    },
    setItem: (key: string, value: string | number, expiresDays: number = 7): void => {
        if (typeof window === 'undefined') return
        try {
            Cookies.set(key, String(value), {
                expires: expiresDays,
                ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
                path: '/',
                sameSite: 'Lax',
                secure: isHttps,
            })
        } catch (e) {
            console.warn('Cookie недоступны (запись)', e)
        }
    },
    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return
        try {
            if (COOKIE_DOMAIN) Cookies.remove(key, { domain: COOKIE_DOMAIN, path: '/' })
            // Also clear any host-only legacy copy.
            Cookies.remove(key, { path: '/' })
        } catch (e) {
            console.warn('Cookie недоступны (удаление)', e)
        }
    },
}
