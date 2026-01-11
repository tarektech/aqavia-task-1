"use client";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import {
  ImageIcon,
  VideoIcon,
  UserIcon,
  MailIcon,
  FileTextIcon,
  X,
} from "lucide-react";
import { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { getAllSavedForms, getFormById, deleteFormById } from "@/lib/storage";
import type { SavedForm } from "@/lib/storage";
import Image from "next/image";

export default function SummaryPage() {
  const [savedForms, setSavedForms] = useState<SavedForm[]>(() =>
    getAllSavedForms()
  );
  const [selectedFormId, setSelectedFormId] = useState<string>(() => {
    const forms = getAllSavedForms();
    return forms.length > 0 ? forms[forms.length - 1].id : "";
  });

  const formData = useMemo(() => {
    if (selectedFormId) {
      return getFormById(selectedFormId);
    }
    return null;
  }, [selectedFormId]);

  const handleFormSelected = (value: string | null) => {
    setSelectedFormId(value || "");
  };

  const handleDeleteForm = () => {
    if (!selectedFormId) return;
    deleteFormById(selectedFormId);
    const updatedForms = getAllSavedForms();
    setSavedForms(updatedForms);

    // Auto-select the latest form if available, otherwise clear selection
    if (updatedForms.length > 0) {
      setSelectedFormId(updatedForms[updatedForms.length - 1].id);
    } else {
      setSelectedFormId("");
    }
  };

  const getFormDisplayName = (form: SavedForm): string => {
    const name = form.data.name?.split(",")[0]?.trim() || "Unnamed";
    const date = new Date(form.submittedAt).toLocaleDateString();
    return `${name} - ${date}`;
  };

  return (
    <Card className="p-4 max-w-2xl mx-auto space-y-4 w-full flex flex-col justify-center items-center">
      <CardHeader className="w-full flex items-center justify-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Select
            value={selectedFormId}
            onValueChange={(value) => handleFormSelected(value)}
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
          {selectedFormId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteForm}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full space-y-6 pt-6">
        {formData ? (
          <>
            {/* Personal Info */}
            <PreviewSection title="Personal Information">
              <div className="grid gap-3">
                <PreviewField
                  icon={UserIcon}
                  label="Name"
                  value={formData?.name || ""}
                />
                <PreviewField
                  icon={MailIcon}
                  label="Email"
                  value={formData?.email || ""}
                />
              </div>
            </PreviewSection>

            <Separator />

            {/* Description */}
            <PreviewSection title="Description (Textarea)">
              <PreviewField
                icon={FileTextIcon}
                label="description"
                value={formData?.description || ""}
              />
            </PreviewSection>

            <Separator />

            {/* Image Preview */}
            <PreviewSection title="Image">
              {formData?.image ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {formData?.image.name}
                  </p>
                  <Image
                    width={100}
                    height={100}
                    src={formData?.image.dataUrl}
                    alt={formData?.image.name}
                    className="w-full max-h-64 object-contain rounded-lg border border-border bg-muted/50"
                  />
                </div>
              ) : (
                <EmptyPreview icon={ImageIcon} text="No image uploaded" />
              )}
            </PreviewSection>

            <Separator />

            {/* Video Preview */}
            <PreviewSection title="Video">
              {formData?.video ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {formData?.video.name}
                  </p>
                  <video
                    src={formData?.video.dataUrl}
                    controls
                    className="w-full max-h-64 rounded-lg border border-border bg-muted/50"
                  />
                </div>
              ) : (
                <EmptyPreview icon={VideoIcon} text="No video uploaded" />
              )}
            </PreviewSection>

            <Separator />

            {/* Radio Selection */}
            <PreviewSection title="Priority (Radio)">
              <p className="text-sm">
                {formData?.radioSingleSelection || (
                  <span className="text-muted-foreground">Not selected</span>
                )}
              </p>
            </PreviewSection>

            <Separator />

            {/* Checkboxes */}
            <PreviewSection title="Options (Checkboxes)">
              <div className="text-sm flex gap-2 flex-wrap">
                {formData?.multiCheckboxes &&
                formData?.multiCheckboxes?.length > 0 ? (
                  formData?.multiCheckboxes?.map((option) => (
                    <p key={option}>{option}</p>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    No options selected
                  </span>
                )}
              </div>
            </PreviewSection>

            <Separator />

            {/* Status */}
            <PreviewSection title="Status (Dropdown)">
              <p className="text-sm">
                {formData?.status || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </PreviewSection>

            <Separator />

            {/* Due Date */}
            <PreviewSection title="Due Date (Date)">
              <p className="text-sm">
                {formData?.dueDate || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </PreviewSection>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select a name to view the data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

//Preview section component for the form data
function PreviewSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      {children}
    </div>
  );
}

//Preview component for the form data
function PreviewField({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm truncate">
          {value || <span className="text-muted-foreground italic">Empty</span>}
        </p>
      </div>
    </div>
  );
}

//Empty preview component for the form data
function EmptyPreview({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-muted-foreground/25 rounded-lg">
      <Icon className="size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
