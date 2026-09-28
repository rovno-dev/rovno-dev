"use client"
import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

/**
 * Fetch the current user, or null.
 *
 * Returns null (not the error body) on every non-OK response. The old
 * behaviour returned `response?.json` unconditionally, so a 401 body like
 * `{detail: "User not found or blocked"}` was handed to the app as if it
 * were a User object — truthy, no `.role`, no `.id`.
 *
 * On 401 specifically we also wipe the stale credentials so the next
 * navigation doesn't repeat the request.
 */
export const fetchMe = async () => {
  const access_token = safeCookieStorage.getItem("access_token")
  if (!access_token) return null

  const response = await $fetch("/api/v1/me", { isToast: false })

  if (response?.response?.status === 401) {
    safeCookieStorage.removeItem("access_token")
    safeCookieStorage.removeItem("refresh_token")
    return null
  }
  if (!response?.response?.ok) return null

  return response.json || null
}
