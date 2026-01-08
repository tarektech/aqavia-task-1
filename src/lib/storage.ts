import type { FormData } from "@/types/form";

const STORAGE_KEY = "storage_form_key";
const COOKIE_NAME = "cookie_form_key";
const COOKIE_DAYS = 3;

export type SavedForm = {
  id: string;
  data: FormData;
  submittedAt: string;
};

// to save the form data to the local storage (appends to array)
export function saveToLocalStorage(data: FormData): string {
  if (typeof window === "undefined") return "";
  const id = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const savedForm: SavedForm = {
    id,
    data,
    submittedAt: new Date().toISOString(),
  };

  const existing = getAllSavedForms();
  existing.push(savedForm);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return id;
}

// to load all saved forms from the local storage
export function getAllSavedForms(): SavedForm[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    // Handle migration from old single-form format
    if (parsed && !Array.isArray(parsed)) {
      // Old format - convert to new format
      const oldForm: SavedForm = {
        id: `form_${Date.now()}_migrated`,
        data: parsed,
        submittedAt: new Date().toISOString(),
      };
      return [oldForm];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// to load a specific form by ID from the local storage
export function getFormById(id: string): FormData | null {
  const forms = getAllSavedForms();
  const found = forms.find((form) => form.id === id);
  return found ? found.data : null;
}

// to load the form data from the local storage (for backward compatibility - returns latest)
export function loadFromLocalStorage(): FormData | null {
  const forms = getAllSavedForms();
  return forms.length > 0 ? forms[forms.length - 1].data : null;
}

// to clear all form data from the local storage
export function clearLocalStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// to delete a specific form by ID
export function deleteFormById(id: string): void {
  if (typeof window === "undefined") return;
  const forms = getAllSavedForms();
  const filtered = forms.filter((form) => form.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// to save the form data to the cookie
// Note: Cookies have ~4KB limit, so we exclude base64 media data and only store metadata
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
// Merges cookie data with localStorage media (since cookie excludes base64 data)
export function hydrateFromStorage(): FormData | null {
  const cookieData = loadFromCookie();
  const localData = loadFromLocalStorage();

  // If cookie exists, use it but merge media from localStorage
  // (cookie only stores metadata, localStorage has full base64)
  if (cookieData) {
    return {
      ...cookieData,
      // Restore media from localStorage if cookie media is empty
      image: cookieData.image?.dataUrl
        ? cookieData.image
        : localData?.image ?? null,
      video: cookieData.video?.dataUrl
        ? cookieData.video
        : localData?.video ?? null,
    };
  }

  // Cookie expired or doesn't exist - fallback to localStorage
  return localData;
}
