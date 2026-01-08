import type { MediaFile } from "@/types/form";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export function fileToMediaFile(file: File): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File size exceeds 10MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}
