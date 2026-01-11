"use client";
import { useFormContext } from "@/context/form-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { MediaFile } from "@/types/form";
import Image from "next/image";
import { useState } from "react";
import { FileUploadField } from "../ui/file-upload-field";

interface ReviewFormProps {
  onUpdate?: () => void;
}

export function ReviewForm({ onUpdate }: ReviewFormProps) {
  const { formData, updateField, submit } = useFormContext();
  const [submittedAt, setSubmittedAt] = useState<string>("");

  const handleUpdate = () => {
    setSubmittedAt(new Date().toLocaleString());
    if (onUpdate) {
      onUpdate();
    } else {
      submit();
    }
  };

  async function UpdateFile(file: File): Promise<MediaFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function ShowFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Bytes`;    
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`; 
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Review Form</h1>
      <div className="flex flex-col  gap-4">
        <div className="flex flex-col gap-2">
          <Label>Name</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <FileUploadField
            id="review-image"
            label="image"
            type="image"
            fileName={formData.image?.name}
            onFileSelect={async (file) => {
              const mediaFile = await UpdateFile(file);
              updateField("image", mediaFile);
            }}
            onFileClear={() => updateField("image", null)}
            className="w-full"
          />
          {formData.image?.dataUrl && (
            <div className="space-y-2 w-full flex flex-col items-center justify-center border border-gray-300 rounded-lg p-2 shadow-sm ">
              <Image
                width={200}
                height={200}
                src={formData.image?.dataUrl}
                alt="Update the image file"
                className="object-cover rounded-lg border border-border bg-muted/50 "
              />
              <p className="text-sm text-muted-foreground">
                {ShowFileSize(formData.image.size)}
              </p>
            </div>
          )}
          {/* <ImagePreview image={formData.image} />  */}
        </div>
        <div className="flex flex-col gap-2">
          <FileUploadField
            id="review-video"
            label="video"
            type="video"
            fileName={formData.video?.name}
            onFileSelect={async (file) => {
              const mediaFile = await UpdateFile(file);
              updateField("video", mediaFile);
            }}
            onFileClear={() => updateField("video", null)}
          />
          {formData.video?.dataUrl && (
            <video
              src={formData.video?.dataUrl}
              controls
              className="w-full max-h-64 rounded-lg border border-border bg-muted/50"
            />
          )}
          {/* <VideoPreview video={formData.video} /> */}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Radio Single Selection</Label>
          <RadioGroup
            value={formData.radioSingleSelection}
            onValueChange={(value) =>
              updateField(
                "radioSingleSelection",
                value as "low" | "medium" | "high" | ""
              )
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="review-low" />
              <Label htmlFor="review-low">Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="review-medium" />
              <Label htmlFor="review-medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="review-high" />
              <Label htmlFor="review-high">High</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Multi Checkboxes</Label>
          <div className="space-y-2">
            {["Option A", "Option B", "Option C"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`review-${option}`}
                  checked={formData.multiCheckboxes.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateField("multiCheckboxes", [
                        ...formData.multiCheckboxes,
                        option,
                      ]);
                    } else {
                      updateField(
                        "multiCheckboxes",
                        formData.multiCheckboxes.filter(
                          (item) => item !== option
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={`review-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateField("status", value as string)}
          >
            <SelectTrigger>
              <SelectValue>{formData.status || "Select status"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateField("dueDate", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Submitted At</Label>
          <Input value={submittedAt || "Not submitted yet"} disabled />
        </div>
      </div>
      <Button className="cursor-pointer" onClick={handleUpdate}>
        Update
      </Button>
    </div>
  );
}

// function ImagePreview({ image }: { image: MediaFile | null }) {
//   if (!image?.dataUrl) {
//     return (
//       <div className="w-full max-h-64 rounded-lg border border-border bg-muted/50">
//         No image uploaded
//       </div>
//     );
//   }
//   return (
//     <Image src={image.dataUrl} alt="Image preview" width={100} height={100} />
//   );
// }

// function VideoPreview({ video }: { video: MediaFile | null }) {
//   return (
//     <video
//       src={video?.dataUrl}
//       controls
//       className="w-full max-h-64 rounded-lg border border-border bg-muted/50"
//     />
//   );
// }
