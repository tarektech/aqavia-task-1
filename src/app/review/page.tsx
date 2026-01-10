"use client";

import { ReviewForm } from "@/components/review/review-form";
import { FormSelector } from "@/components/review/form-selector";
import {
  getAllSavedForms,
  getFormById,
  updateFormById,
  type SavedForm,
} from "@/lib/storage";
import { toast } from "react-hot-toast";
import { useFormContext } from "@/context/form-context";
import { useEffect, useState, startTransition } from "react";
import { CheckCircleIcon } from "lucide-react";

export default function ReviewPage() {
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const { formData, loadFormData } = useFormContext();

  useEffect(() => {
    const forms = getAllSavedForms();
    startTransition(() => {
      setSavedForms(forms);
      if (forms.length > 0) {
        setSelectedFormId(forms[forms.length - 1].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      const data = getFormById(selectedFormId);
      if (data) {
        loadFormData(data);
      }
    }
  }, [selectedFormId, loadFormData]);

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
  };

  const handleUpdate = () => {
    if (!selectedFormId) {
      toast.error("Please select a form to update");
      return;
    }

    try {
      updateFormById(selectedFormId, formData);
      toast.success("Form updated successfully", {
        icon: <CheckCircleIcon className="size-4" />,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update form"
      );
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <FormSelector
        selectedFormId={selectedFormId}
        savedForms={savedForms}
        onFormSelect={handleFormSelect}
      />
      {selectedFormId && (
        <ReviewForm
          onUpdate={() => {
            handleUpdate();
          }}
        />
      )}
      {!selectedFormId && savedForms.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No saved forms available
        </div>
      )}
    </div>
  );
}
