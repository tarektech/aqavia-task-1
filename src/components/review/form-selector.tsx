"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SavedForm } from "@/lib/storage";

interface FormSelectorProps {
  selectedFormId: string;
  savedForms: SavedForm[];
  onFormSelect: (formId: string) => void;
}

export function FormSelector({
  selectedFormId,
  savedForms,
  onFormSelect,
}: FormSelectorProps) {
  const getFormDisplayName = (form: SavedForm): string => {
    const name = form.data.name?.split(",")[0]?.trim() || "Unnamed";
    const date = new Date(form.submittedAt).toLocaleDateString();
    return `${name} - ${date}`;
  };

  return (
    <Select
      value={selectedFormId}
      onValueChange={(value) => onFormSelect(value || "")}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue>
          {selectedFormId
            ? getFormDisplayName(
                savedForms.find((f) => f.id === selectedFormId)!
              )
            : "Select a saved form"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {savedForms.length > 0 ? (
          savedForms
            .slice()
            .reverse()
            .map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {getFormDisplayName(form)}
              </SelectItem>
            ))
        ) : (
          <SelectItem value="no-data" disabled>
            No saved forms available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
