"use client";

import {
  createContext,
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

function validateForm(formData: FormData) {
  const errors: Record<keyof FormData, string> = {
    name: "",
    email: "",
    description: "",
    image: "",
    video: "",
    radioSingleSelection: "",
    multiCheckboxes: "",
    status: "",
    dueDate: "",
  };
  if (!formData.name) errors.name = "Name is required";
  if (!formData.email) errors.email = "Email is required";
  if (!formData.description) errors.description = "Description is required";
  if (!formData.image) errors.image = "Image is required";
  if (!formData.video) errors.video = "Video is required";
  if (!formData.radioSingleSelection)
    errors.radioSingleSelection = "Priority is required";
  if (!formData.multiCheckboxes)
    errors.multiCheckboxes = "Options are required";
  if (!formData.status) errors.status = "Status is required";
  if (!formData.dueDate) errors.dueDate = "Due Date is required";
  return errors;
}

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
  const [inputError, setInputError] = useState<Record<keyof FormData, string>>(
    () => {
      return validateForm(initialFormData);
    }
  );

  useEffect(() => {
    setInputError(validateForm(formData));
  }, [formData]);

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

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  function submit() {
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
      setInputError((prev) => ({
        ...prev,
        [Object.keys(formData)[0]]:
          error instanceof Error ? error.message : "An error occurred",
      }));
    } finally {
      setIsLoading(false);
    }
  }

  function reset(clearStorage = false) {
    dispatch({ type: "RESET" });
    if (clearStorage) {
      clearLocalStorage();
      clearCookie();
    }
  }

  return (
    <FormContext.Provider
      value={{
        formData,
        isHydrated,
        updateField,
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
