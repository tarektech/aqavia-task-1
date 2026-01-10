"use client";
import { useFormContext } from "@/context/form-context";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  ImageIcon,
  VideoIcon,
  UserIcon,
  MailIcon,
  FileTextIcon,
} from "lucide-react";
import { ComponentType } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
export function Preview() {
  const { formData } = useFormContext();

  return (
    <Card className="md:sticky md:top-0">
      <CardContent className="space-y-6 pt-6">
        {/* Personal Info */}
        <PreviewSection title="Personal Information">
          <div className="grid gap-3">
            <PreviewField icon={UserIcon} label="Name" value={formData.name} />
            <PreviewField
              icon={MailIcon}
              label="Email"
              value={formData.email}
            />
          </div>
        </PreviewSection>

        <Separator />

        {/* Description */}
        <PreviewSection title="Description (Textarea)">
          <PreviewField
            icon={FileTextIcon}
            label="description"
            value={formData.description}
          />
        </PreviewSection>

        <Separator />

        {/* Image Preview */}
        <PreviewSection title="Image">
          {formData.image ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {formData.image.name}
              </p>
              <Image
                width={100}
                height={100}
                src={formData.image.dataUrl}
                alt={formData.image.name}
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
          {formData.video ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {formData.video.name}
              </p>
              <video
                src={formData.video.dataUrl}
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
            {formData.radioSingleSelection || (
              <span className="text-muted-foreground">Not selected</span>
            )}
          </p>
        </PreviewSection>

        <Separator />

        {/* Checkboxes */}
        <PreviewSection
          title="Options (Checkboxes)
        "
        >
          <div className="text-sm flex gap-2">
            {formData.multiCheckboxes.map((option) => (
              <p key={option}>{option}</p>
            ))}
          </div>
        </PreviewSection>

        <Separator />

        {/* Status */}
        <PreviewSection title="Status (Dropdown)">
          <p className="text-sm">
            {formData.status || (
              <span className="text-muted-foreground">Not set</span>
            )}
          </p>
        </PreviewSection>

        <Separator />

        {/* Due Date */}
        <PreviewSection title="Due Date (Date)">
          <p className="text-sm">
            {formData.dueDate || (
              <span className="text-muted-foreground">Not set</span>
            )}
          </p>
        </PreviewSection>
      </CardContent>
    </Card>
  );
}

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
