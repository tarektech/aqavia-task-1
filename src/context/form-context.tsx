"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { FormData, initialFormData } from "@/types/form";
import {
  clearCookie,
  clearLocalStorage,
  hydrateFromStorage,
  loadFromLocalStorage,
  saveToCookie,
  saveToLocalStorage,
} from "@/lib/storage";

type FormActionType =
  | {
      type: "SET_FIELD"; // set a single field
      field: keyof FormData; //the field to be set
      value: FormData[keyof FormData];
    }
  | { type: "SET_ALL"; data: FormData } // set all fields at once
  | { type: "RESET" } // reset all fields to initial state
  | { type: "HYDRATE"; data: FormData }; // hydrate the form with initial data
//hydrate means to populate the form with data from the server

type FormContextType = {
  formData: FormData; // the current form data
  isHydrated: boolean; // whether the form has been hydrated
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void; // update a single field
  loadFormData: (data: FormData) => void; // load form data (set all fields at once)
  submit: () => void; // submit the form data to the server
  reset: (clearStorage?: boolean) => void; // reset the form to initial state, optionally clear storage
  isLoading: boolean; // whether the form is loading
  isFormValid: boolean; // whether all required fields are filled
};

const FormContext = createContext<FormContextType | null>(null);

function formReducer(state: FormData, action: FormActionType): FormData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ALL": // set all fields at once
    case "HYDRATE": // hydrate the form with initial data
      return action.data;
    case "RESET":
      return initialFormData;
    default:
      return state;
  }
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if all required fields are filled
  const isFormValid = Boolean(
    formData.name.trim() &&
      formData.email.trim() &&
      formData.description.trim() &&
      formData.image &&
      formData.video &&
      formData.radioSingleSelection &&
      formData.status
  );

  // to hydrate the form data from the cookie or local storage on mount
  useEffect(() => {
    const stored = hydrateFromStorage();
    if (stored) {
      // Merge with initialFormData to ensure all fields exist (handles missing/undefined fields from old stored data)
      dispatch({ type: "HYDRATE", data: { ...initialFormData, ...stored } });
    }
    setIsHydrated(true);
  }, []);

  const updateField = useCallback(
    <Key extends keyof FormData>(field: Key, value: FormData[Key]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  const loadFormData = useCallback((data: FormData) => {
    // Merge with initialFormData to ensure all fields exist
    dispatch({ type: "SET_ALL", data: { ...initialFormData, ...data } });
  }, []);

  const submit = () => {
    setIsLoading(true);
    try {
      saveToLocalStorage(formData);
      saveToCookie(formData);
      // Verify data was saved
      const saved = loadFromLocalStorage();
      console.log("✅ Form data saved to localStorage:", saved);
      console.log("📦 Saved data keys:", Object.keys(saved || {}));
    } catch (error) {
      console.error("❌ Failed to save form data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = (clearStorage = false) => {
    dispatch({ type: "RESET" });
    if (clearStorage) {
      clearLocalStorage();
      clearCookie();
    }
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        isHydrated,
        updateField,
        loadFormData,
        submit,
        reset,
        isLoading,
        isFormValid,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context)
    throw new Error("useFormContext must be used within FormProvider");
  return context;
}
