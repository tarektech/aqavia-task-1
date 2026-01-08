export type FormData = {
  // Text inputs
  name: string;
  email: string;

  // Textarea
  description: string;

  // Media (base64 data URLs)
  image: MediaFile | null;
  video: MediaFile | null;

  // Radio (single selection)
  radioSingleSelection: "low" | "medium" | "high" | "";

  // Checkboxes (multi-select)
  multiCheckboxes: string[];

  // Select dropdown
  status: string;

  // Date
  dueDate: string;
};

export type MediaFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64
};

export const initialFormData: FormData = {
  name: "",
  email: "",
  description: "",
  image: null,
  video: null,
  radioSingleSelection: "",
  multiCheckboxes: [],
  status: "",
  dueDate: "",
};
