import { Document } from "@/types";

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CompressedImageResult {
  base64Data: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface FileUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  compressImages?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
  imageQuality?: number;
  onProgress?: (progress: FileUploadProgress) => void;
}

export class FileService {
  private static readonly DEFAULT_MAX_SIZE_MB = 5;
  private static readonly DEFAULT_IMAGE_QUALITY = 0.8;
  private static readonly DEFAULT_MAX_IMAGE_WIDTH = 1920;
  private static readonly DEFAULT_MAX_IMAGE_HEIGHT = 1080;

  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ];

  /**
   * Convert a file to Base64 string with progress tracking
   */
  async convertToBase64(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<string> {
    const { onProgress } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (onProgress) {
          onProgress({
            loaded: file.size,
            total: file.size,
            percentage: 100,
          });
        }
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.onprogress = (event) => {
        if (onProgress && event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate file type and size
   */
  validateFile(
    file: File,
    options: FileUploadOptions = {}
  ): FileValidationResult {
    const {
      maxSizeMB = FileService.DEFAULT_MAX_SIZE_MB,
      allowedTypes = FileService.ALLOWED_TYPES,
    } = options;

    const errors: string[] = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSizeBytes)})`
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push("File is empty");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compress an image file
   */
  async compressImage(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<CompressedImageResult> {
    const {
      maxImageWidth = FileService.DEFAULT_MAX_IMAGE_WIDTH,
      maxImageHeight = FileService.DEFAULT_MAX_IMAGE_HEIGHT,
      imageQuality = FileService.DEFAULT_IMAGE_QUALITY,
    } = options;

    if (!file.type.startsWith("image/")) {
      throw new Error("File is not an image");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > maxImageWidth || height > maxImageHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxImageWidth;
            height = width / aspectRatio;
          } else {
            height = maxImageHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL(file.type, imageQuality);
        const originalSize = file.size;
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);

        resolve({
          base64Data: compressedBase64,
          originalSize,
          compressedSize,
          compressionRatio: originalSize / compressedSize,
        });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  }

  /**
   * Process file upload with validation, compression, and progress tracking
   */
  async processFileUpload(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<string> {
    const { compressImages = true } = options;

    // Validate file
    const validation = this.validateFile(file, options);
    if (!validation.isValid) {
      throw new Error(
        `File validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Compress image if it's an image file and compression is enabled
    if (compressImages && file.type.startsWith("image/")) {
      try {
        const compressed = await this.compressImage(file, options);
        return compressed.base64Data;
      } catch (error) {
        // If compression fails, fall back to original file
        console.warn("Image compression failed, using original file:", error);
        return this.convertToBase64(file, options);
      }
    }

    // Convert to base64
    return this.convertToBase64(file, options);
  }

  /**
   * Download a file from base64 data
   */
  downloadFile(base64Data: string, filename: string): void {
    try {
      const link = document.createElement("a");
      link.href = base64Data;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Download JSON data as a file
   */
  downloadJSON(data: any, filename: string): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename.endsWith(".json")
        ? filename
        : `${filename}.json`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        `Failed to download JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Create a preview URL for a file
   */
  createPreviewUrl(base64Data: string): string {
    return base64Data;
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  /**
   * Get MIME type from file extension
   */
  getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
      csv: "text/csv",
    };

    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Check if file is an image
   */
  isImage(file: File): boolean {
    return file.type.startsWith("image/");
  }

  /**
   * Check if file is a PDF
   */
  isPDF(file: File): boolean {
    return file.type === "application/pdf";
  }

  /**
   * Extract metadata from a file
   */
  extractFileMetadata(file: File): {
    name: string;
    size: number;
    type: string;
    lastModified: Date;
    extension: string;
  } {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      extension: this.getFileExtension(file.name),
    };
  }

  /**
   * Validate file type (backward compatibility)
   */
  validateFileType(file: File, allowedTypes?: string[]): boolean {
    const types = allowedTypes || FileService.ALLOWED_TYPES;
    return types.includes(file.type);
  }

  /**
   * Validate file size (backward compatibility)
   */
  validateFileSize(file: File, maxSizeMB?: number): boolean {
    const maxSize = maxSizeMB || FileService.DEFAULT_MAX_SIZE_MB;
    const maxSizeBytes = maxSize * 1024 * 1024;
    return file.size <= maxSizeBytes && file.size > 0;
  }

  /**
   * Create a Document object from a file
   */
  async createDocumentFromFile(
    file: File,
    additionalData: Partial<Document>,
    options: FileUploadOptions = {}
  ): Promise<Omit<Document, "id" | "createdAt" | "updatedAt">> {
    const base64Data = await this.processFileUpload(file, options);
    const metadata = this.extractFileMetadata(file);

    return {
      title: additionalData.title || file.name,
      category: additionalData.category || "business_documents",
      fileData: base64Data,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      familyMemberId: additionalData.familyMemberId,
      propertyId: additionalData.propertyId,
      insurancePolicyId: additionalData.insurancePolicyId,
      expiryDate: additionalData.expiryDate,
      issuedDate: additionalData.issuedDate,
      issuer: additionalData.issuer,
      documentNumber: additionalData.documentNumber,
      tags: additionalData.tags || [],
    };
  }
}

// Export singleton instance
export const fileService = new FileService();
