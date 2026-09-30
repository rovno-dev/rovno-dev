"use client"
import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

/**
 * Fetch the current user, or null.
 *
 * Important: a 401 from /api/v1/me means the access token is dead AND
 * the refresh attempt failed. But $fetch already retries with the
 * refresh token on 401, so a final 401 here is genuinely terminal.
 *
 * A network error (backend not up yet during deploy) throws inside
 * $fetch and lands in the catch — we return null WITHOUT wiping cookies,
 * so the next page load picks up where we left off.
 */
export const fetchMe = async () => {
  const access_token = safeCookieStorage.getItem("access_token")
  if (!access_token) return null

  let response
  try {
    response = await $fetch("/api/v1/me", { isToast: false })
  } catch {
    // Network failure (backend restarting, DNS blip). Don't touch
    // cookies — the session is almost certainly still valid.
    return null
  }

  // Only wipe on a real 401 from the identity endpoint itself.
  if (response?.response?.status === 401) {
    safeCookieStorage.removeItem("access_token")
    safeCookieStorage.removeItem("refresh_token")
    return null
  }

  if (!response?.response?.ok) return null
  return response.json || null
}
