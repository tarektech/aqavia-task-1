import type { FormData } from "@/types/form";
import { toast } from "react-hot-toast";

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

  try {
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("quota")) {
      toast.error(
        "Storage quota exceeded. The video file is too large. Please check"
      );
    }
    throw error;
  }
}

// to load all saved forms from the local storage
export function getAllSavedForms(): SavedForm[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    console.log("parsed", parsed);
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

// to update a specific form by ID
export function updateFormById(id: string, data: FormData): void {
  if (typeof window === "undefined") return;

  try {
    const forms = getAllSavedForms();
    const updated = forms.map((form) =>
      form.id === id
        ? { ...form, data, submittedAt: new Date().toISOString() }
        : form
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Also update the cookie with the latest form data
    saveToCookie(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("quota")) {
      throw new Error(
        "Storage quota exceeded. The video file is too large. Please:\n" +
          "1. Use a smaller video file (< 5MB recommended)\n" +
          "2. Or compress the video before uploading\n" +
          "3. Or delete old forms to free up space"
      );
    }
    throw error;
  }
}

// to save the form data to the cookie
// Note: Cookies have ~4KB limit, so we exclude base64 media data and only store metadata
export function saveToCookie(data: FormData): void {
  if (typeof document === "undefined") return;

  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_DAYS);

    // Exclude base64 dataUrl from media files to stay within cookie size limit
    const cookieData: FormData = {
      ...data,
      image: data.image
        ? {
            name: data.image.name,
            type: data.image.type,
            size: data.image.size,
            dataUrl: "", // Exclude base64 data
          }
        : null,
      video: data.video
        ? {
            name: data.video.name,
            type: data.video.type,
            size: data.video.size,
            dataUrl: "", // Exclude base64 data
          }
        : null,
    };

    const encoded = encodeURIComponent(JSON.stringify(cookieData));
    const cookieString = `${COOKIE_NAME}=${encoded}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Check if cookie would exceed size limit (4096 bytes)
    // if (cookieString.length > 4096) {
    //   console.warn("Cookie data too large, skipping cookie save");
    //   return;
    // }

    document.cookie = cookieString;

    // Verify cookie was set
    const saved = loadFromCookie();
    if (!saved) {
      console.warn("Cookie may not have been saved successfully");
    }
  } catch (error) {
    console.error("Failed to save cookie:", error);
  }
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
