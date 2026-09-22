// LLM context: js-cookie ships no types and @types/js-cookie is not installed.
// This ambient declaration is the minimum surface safe-cookie-storage.ts uses.
// If you later install @types/js-cookie, delete this file — otherwise the two
// declarations collide.
declare module "js-cookie" {
  type CookieValue = string | number | boolean | null | undefined;
  interface CookieAttributes {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }
  interface CookiesStatic {
    get(key: string): string | undefined;
    get(): Record<string, string>;
    set(key: string, value: CookieValue, options?: CookieAttributes): string | undefined;
    remove(key: string, options?: CookieAttributes): void;
  }
  const Cookies: CookiesStatic;
  export default Cookies;
}
