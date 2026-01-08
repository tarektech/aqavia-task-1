"use client";

import { useRef, useState, useEffect } from "react";
import {
  ImageIcon,
  VideoIcon,
  FileIcon,
  XIcon,
  CheckCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { Label } from "./label";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FileType = "image" | "video" | "file";
type UploadStatus = "idle" | "uploading" | "completed" | "error";

interface FileUploadFieldProps {
  id: string;
  label: string;
  type?: FileType;
  accept?: string;
  hint?: string;
  className?: string;
  fileName?: string;
  onFileSelect?: (file: File) => Promise<void> | void;
  onFileClear?: () => void;
}

const iconMap: Record<FileType, LucideIcon> = {
  image: ImageIcon,
  video: VideoIcon,
  file: FileIcon,
};

const defaultHints: Record<FileType, string> = {
  image: "PNG, JPG, GIF up to 10MB",
  video: "MP4, MOV, AVI up to 50MB",
  file: "Any file up to 10MB",
};

const defaultAccepts: Record<FileType, string> = {
  image: "image/*",
  video: "video/*",
  file: "*",
};

export function FileUploadField({
  id,
  label,
  type = "file",
  accept,
  hint,
  className,
  fileName,
  onFileSelect,
  onFileClear,
}: FileUploadFieldProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = iconMap[type];
  const displayHint = hint ?? defaultHints[type]; // hint for the file type

  const acceptType = accept ?? defaultAccepts[type]; // what type of file is accepted

  // Sync with external fileName prop to show the file name in the preview
  useEffect(() => {
    if (fileName) {
      setCurrentFileName(fileName);
      setStatus("completed");
      setProgress(100);
    } else if (!fileName && status === "completed") {
      setCurrentFileName(null);
      setStatus("idle");
      setProgress(0);
    }
  }, [fileName]);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);
    return interval;
  };

  const processFile = async (file: File) => {
    setCurrentFileName(file.name);
    setStatus("uploading");

    const progressInterval = simulateProgress();

    try {
      await onFileSelect?.(file);
      clearInterval(progressInterval);
      setProgress(100);
      setStatus("completed");
    } catch {
      clearInterval(progressInterval);
      setStatus("error");
    }
  };

  //** handling all the events for the file upload */
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  /****************************************************** */

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0]; // get the first file from the data transfer
    if (!file) return;

    // Validate file type if accept is specified
    if (acceptType !== "*") {
      //accept only the file types that are specified in the acceptType
      const acceptedTypes = acceptType.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((acceptedType) => {
        if (acceptedType.endsWith("/*")) {
          return file.type.startsWith(acceptedType.replace("/*", "/"));
        }
        return file.type === acceptedType;
      });

      if (!isAccepted) {
        toast.error(`Please upload a valid ${type} file`);
        return;
      }
    }

    await processFile(file);
  };

  const handleClear = () => {
    setCurrentFileName(null);
    setStatus("idle");
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileClear?.();
  };

  // Uploading or completed state - show file info with progress
  if (status === "uploading" || status === "completed") {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{label}</Label>
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate">{currentFileName}</p>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            {status === "uploading" ? (
              <div className="mt-2">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {Math.round(progress)}%
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircleIcon className="size-3.5 text-green-500" />
                <p className="text-xs text-green-600">Upload complete</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Idle state - show upload dropzone
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <label
        htmlFor={id}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "flex items-center justify-center size-12 rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "size-5 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging
              ? `Drop ${type} here`
              : `Drag & drop or click to upload`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{displayHint}</p>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="sr-only"
          onChange={handleChange}
          accept={acceptType}
        />
      </label>
    </div>
  );
}
