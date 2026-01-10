"use client";
import { useFormContext } from "@/context/form-context";
import { fileToMediaFile } from "@/lib/media";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "./ui/file-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function FormRequirements() {
  const [isChecked, setIsChecked] = useState(false);
  const { formData, updateField, submit, isLoading, reset, isFormValid } =
    useFormContext();

  const handleFileSelect = async (file: File, field: "image" | "video") => {
    try {
      const mediaFile = await fileToMediaFile(file);
      updateField(field, mediaFile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && isChecked) {
      submit();
      toast.success("Form submitted successfully");
      // Reset form fields but keep localStorage data for viewing on summary page
      reset(false); // Don't clear storage - data persists for summary page
      setIsChecked(false);
    } else {
      toast.error("Please fill all required fields"); //TODO: add a more detailed error message
    }
  };
  return (
    <Card>
      <CardContent>
        <form className="space-y-8 " onSubmit={handleSubmit}>
          {/* input fields */}
          <div className={`space-y-4`}>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />

            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <Separator />
          {/* textarea field */}
          <div className="space-y-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter your requirements"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <Separator />
          {/* file image upload field */}
          <FileUploadField
            id="image-upload"
            label="Upload Image"
            type="image"
            fileName={formData.image?.name}
            onFileSelect={(file) => handleFileSelect(file, "image")}
            onFileClear={() => updateField("image", null)}
          />
          <Separator />
          {/* file video upload field */}
          <FileUploadField
            id="video-upload"
            label="Upload Video"
            type="video"
            fileName={formData.video?.name}
            onFileSelect={(file) => handleFileSelect(file, "video")}
            onFileClear={() => updateField("video", null)}
          />
          <Separator />
          {/* radio button field */}
          <div className={`space-y-4`}>
            <Label>Priority</Label>
            <RadioGroup
              value={formData.radioSingleSelection}
              onValueChange={(value) =>
                updateField(
                  "radioSingleSelection",
                  value as "low" | "medium" | "high"
                )
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High</Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
          {/* multi-checkbox field */}
          <div className="space-y-4">
            <Label>Options</Label>
            <div className={`space-y-2 `}>
              {["Option A", "Option B", "Option C"].map((option) => (
                <div key={option} className={`flex items-center gap-2`}>
                  <Checkbox
                    id={option}
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
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          {/* dropdown field */}
          <div className="space-y-4">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField("status", value as string)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue>{formData.status || "Select status"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
          <Separator />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isChecked"
              checked={isChecked}
              onCheckedChange={setIsChecked}
            />
            <Label htmlFor="isChecked">
              I agree to the terms and conditions
            </Label>
          </div>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={!isFormValid || !isChecked || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
