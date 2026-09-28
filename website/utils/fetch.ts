"use client";
import { toast } from "sonner"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

export interface FetchResult {
  response?: any
  json?: any
}

interface FetchOptions {
  method?: string
  body?: BodyInit | null
  isToast?: boolean
  headers?: Record<string, string>
  onLoadingChange?: (loading: boolean) => void
  /** Internal — prevents infinite refresh loops. Do not pass. */
  _retried?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// Auth endpoints: a 401 there is a real credential failure, not a stale
// session. Skip the refresh-and-retry dance for those — and (see below)
// never toast their backend messages, because "User not found or blocked"
// from /refresh or /login is a session state, not a user-action error.
const NO_RETRY = /\/login|\/register|\/verify|\/refresh|\/logout/

async function refreshAccessToken(): Promise<string | null> {
  const refresh_token = safeCookieStorage.getItem("refresh_token")
  if (!refresh_token) return null
  try {
    const res = await fetch(API_URL + "/api/v1/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const token = data?.access_token
    if (token) {
      safeCookieStorage.setItem("access_token", token)
      return token
    }
  } catch {
    /* network failure — fall through, caller sees the original 401 */
  }
  return null
}

export async function $fetch(
  route: string,
  { method = "GET", body = null, isToast = true, headers = {}, onLoadingChange, _retried = false }: FetchOptions = {}
): Promise<FetchResult> {
  // Build headers fresh each call so the retry picks up the refreshed token.
  const finalHeaders: Record<string, string> = { Accept: "application/json", ...headers }

  // If the caller is sending a JSON-looking string body but forgot to set
  // Content-Type (or set it to a variant that doesn't survive, like the
  // "Content-TextT" typo), the browser defaults to text/plain and FastAPI
  // rejects it with "Input should be a valid dictionary or object to
  // extract fields from". Set it here so every call site gets it right.
  if (typeof body === "string") {
    const hasContentType = Object.keys(finalHeaders).some(
      (k) => k.toLowerCase() === "content-type"
    )
    if (!hasContentType) {
      const trimmed = body.trimStart()
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        finalHeaders["Content-Type"] = "application/json"
      }
    }
  }

  const token = safeCookieStorage.getItem("access_token")
  if (token) finalHeaders.Authorization = "Bearer " + token

  const url = API_URL + route
  let response = await fetch(url, { method, body, headers: finalHeaders })

  if (response.status === 401 && !_retried && !NO_RETRY.test(route)) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Recursive retry; the second call reads the just-written token.
      return $fetch(route, { method, body, isToast, headers, onLoadingChange, _retried: true })
    }
  }

  let json
  try {
    json = await response.json()
  } catch { /* empty body — leave json undefined */ }

  const rawMessage = json?.message
  // Guard: only treat `message` as a toast payload if it's a string.
  // Non-string values (e.g. FastAPI validation errors) previously
  // crashed the Toaster with "Objects are not valid as a React child".
  const message = typeof rawMessage === "string" ? rawMessage : null
  // Backstop: never toast from an auth endpoint. A 401 there is expected
  // state (logged out, expired, blocked) that the UI already reflects —
  // toasting it produces the "User not found or blocked" noise on every
  // page load.
  const fromAuthEndpoint = NO_RETRY.test(route)
  if (message && isToast && !fromAuthEndpoint) {
    if (!response?.ok) toast.error(message)
    else toast.success(message)
  }

  await onLoadingChange?.(false)
  return { response, json }
}
