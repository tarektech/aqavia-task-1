import type { FormData } from "@/types/form";

const STORAGE_KEY = "storage_form_key";
const COOKIE_NAME = "cookie_form_key";
const COOKIE_DAYS = 3;

// to save the form data to the local storage
export function saveToLocalStorage(data: FormData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// to load the form data from the local storage
export function loadFromLocalStorage(): FormData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// to clear the form data from the local storage
export function clearLocalStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// to save the form data to the cookie
export function saveToCookie(data: FormData): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);

  const encoded = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

// to load the form data from the cookie
export function loadFromCookie(): FormData | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME && value) {
      return JSON.parse(decodeURIComponent(value));
    }
  }
  return null;
}

// to clear the form data from the cookie
export function clearCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; expires=${new Date(
    0
  ).toUTCString()}; path=/;`;
}

// to hydrate the form data from the cookie or local storage
export function hydrateFromStorage(): FormData | null {
  // First, try to load form data from the cookie.
  // If the cookie doesn't exist or is empty (returns null),
  // fall back to loading from localStorage using the nullish coalescing operator (??).
  // This prioritizes cookie storage over localStorage for hydration.
  return loadFromCookie() ?? loadFromLocalStorage();
}
