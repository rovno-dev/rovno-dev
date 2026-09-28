/**
 * Normalize an error payload from the API into a renderable string.
 *
 * FastAPI can return errors in a handful of shapes:
 *   - { detail: "message" }                            (HTTPException)
 *   - { detail: [{type, loc, msg, input}, ...] }       (422 validation)
 *   - { detail: {type, loc, msg, input} }              (unusual)
 *   - { message: "message" }                           (JSONResponse)
 *
 * Passing any object/array shape straight into toast.error() crashes the
 * Sonner <Toaster> with "Objects are not valid as a React child". This
 * helper always returns a plain string.
 */
export function extractErrorMessage(
  payload: any,
  fallback = "Что-то пошло не так",
): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload !== "object") return String(payload);

  const raw = payload.detail ?? payload.message;

  if (typeof raw === "string") return raw;

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        if (typeof item.msg === "string") return item.msg;
        if (typeof item.message === "string") return item.message;
      }
    }
    return fallback;
  }

  if (raw && typeof raw === "object") {
    if (typeof raw.msg === "string") return raw.msg;
    if (typeof raw.message === "string") return raw.message;
  }

  return fallback;
}
