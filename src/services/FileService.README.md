# FileService Documentation

The FileService is a comprehensive file handling service that provides Base64 conversion, file validation, image compression, drag-and-drop upload support, and progress tracking for the Family Business Management System.

## Features

### ✅ Core Functionality

- **File Validation**: Type and size validation with customizable options
- **Base64 Conversion**: Convert files to Base64 with progress tracking
- **Image Compression**: Automatic image compression and resizing
- **File Download**: Download files from Base64 data
- **JSON Export/Import**: Export and import data as JSON files
- **Progress Tracking**: Real-time progress indicators for file operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

### ✅ UI Components

- **FileUpload**: Drag-and-drop file upload component with preview
- **FilePreview**: File preview component with download and delete actions
- **Progress Indicators**: Visual progress bars during file processing
- **File Thumbnails**: Image thumbnails and file type icons

### ✅ Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX
- **Text**: TXT, CSV

## Usage Examples

### Basic File Upload

```typescript
import { fileService } from "@/services/FileService";

// Convert file to Base64
const base64Data = await fileService.convertToBase64(file);

// Process file with validation and compression
const processedData = await fileService.processFileUpload(file, {
  maxSizeMB: 5,
  compressImages: true,
  maxImageWidth: 1920,
  maxImageHeight: 1080,
  imageQuality: 0.8,
});
```

### File Validation

```typescript
const validation = fileService.validateFile(file, {
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
});

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
}
```

### Image Compression

```typescript
const compressed = await fileService.compressImage(file, {
  maxImageWidth: 1920,
  maxImageHeight: 1080,
  imageQuality: 0.8,
});

console.log("Compression ratio:", compressed.compressionRatio);
console.log("Original size:", compressed.originalSize);
console.log("Compressed size:", compressed.compressedSize);
```

### File Download

```typescript
// Download a file
fileService.downloadFile(base64Data, "document.pdf");

// Download JSON data
fileService.downloadJSON(data, "export.json");
```

### Create Document from File

```typescript
const document = await fileService.createDocumentFromFile(file, {
  title: "Important Document",
  category: "business_documents",
  familyMemberId: "family-1",
  tags: ["important", "business"],
  expiryDate: new Date("2024-12-31"),
});
```

## FileUpload Component

The FileUpload component provides a complete drag-and-drop file upload interface.

```tsx
import { FileUpload } from "@/components/ui/FileUpload";

<FileUpload
  onFileSelect={(files) => console.log("Files selected:", files)}
  onFileProcessed={(base64Data, file) => {
    // Handle processed file
  }}
  multiple={true}
  maxFiles={10}
  options={{
    maxSizeMB: 5,
    compressImages: true,
    maxImageWidth: 1920,
    maxImageHeight: 1080,
    imageQuality: 0.8,
  }}
/>;
```

### Props

- `onFileSelect`: Callback when files are selected
- `onFileProcessed`: Callback when a file is processed
- `multiple`: Allow multiple file selection
- `accept`: File type filter
- `maxFiles`: Maximum number of files
- `options`: FileUploadOptions for processing
- `disabled`: Disable the upload area

## FilePreview Component

The FilePreview component displays uploaded files with preview, download, and delete actions.

```tsx
import { FilePreview } from "@/components/ui/FilePreview";

<FilePreview
  document={document}
  onDownload={(doc) => fileService.downloadFile(doc.fileData, doc.fileName)}
  onDelete={(doc) => handleDelete(doc)}
  showActions={true}
/>;
```

### Props

- `document`: Document object to preview
- `onDownload`: Download callback
- `onDelete`: Delete callback
- `showActions`: Show/hide action buttons
- `className`: Additional CSS classes

## Configuration Options

### FileUploadOptions

```typescript
interface FileUploadOptions {
  maxSizeMB?: number; // Maximum file size in MB (default: 5)
  allowedTypes?: string[]; // Allowed MIME types
  compressImages?: boolean; // Enable image compression (default: true)
  maxImageWidth?: number; // Maximum image width (default: 1920)
  maxImageHeight?: number; // Maximum image height (default: 1080)
  imageQuality?: number; // Image quality 0-1 (default: 0.8)
  onProgress?: (progress: FileUploadProgress) => void; // Progress callback
}
```

### Default Settings

```typescript
const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_IMAGE_QUALITY = 0.8;
const DEFAULT_MAX_IMAGE_WIDTH = 1920;
const DEFAULT_MAX_IMAGE_HEIGHT = 1080;

const ALLOWED_TYPES = [
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
```

## Utility Methods

### File Information

```typescript
// Get file extension
const extension = fileService.getFileExtension("document.pdf"); // 'pdf'

// Get MIME type from extension
const mimeType = fileService.getMimeTypeFromExtension("jpg"); // 'image/jpeg'

// Format file size
const formatted = fileService.formatFileSize(1024); // '1 KB'

// Check file type
const isImage = fileService.isImage(file);
const isPDF = fileService.isPDF(file);

// Extract metadata
const metadata = fileService.extractFileMetadata(file);
```

## Error Handling

The FileService includes comprehensive error handling:

```typescript
try {
  const result = await fileService.processFileUpload(file);
} catch (error) {
  if (error.message.includes("validation failed")) {
    // Handle validation error
  } else if (error.message.includes("Failed to read file")) {
    // Handle file read error
  } else {
    // Handle other errors
  }
}
```

## Performance Considerations

### Image Compression

- Images are automatically compressed to reduce storage size
- Compression maintains aspect ratio
- Quality can be adjusted (0.1 - 1.0)
- Large images are resized to maximum dimensions

### Progress Tracking

- Real-time progress updates during file processing
- Progress callbacks for UI updates
- Batch processing support

### Memory Management

- Object URLs are automatically cleaned up
- Base64 data is efficiently handled
- File previews use object URLs when possible

## Demo Page

Visit `/file-demo` to see the FileService in action with:

- Drag-and-drop file upload
- Real-time progress tracking
- File preview and management
- Compression statistics
- Export functionality

## Integration with Document Management

The FileService integrates seamlessly with the document management system:

```typescript
// Create a document from uploaded file
const document = await fileService.createDocumentFromFile(file, {
  title: file.name,
  category: "business_documents",
  familyMemberId: "family-1",
  tags: ["uploaded"],
});

// Save to localStorage using LocalStorageService
localStorageService.saveDocument({
  ...document,
  id: generateId(),
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Browser Compatibility

The FileService uses modern browser APIs:

- FileReader API for file reading
- Canvas API for image compression
- Blob API for file downloads
- URL.createObjectURL for previews

Supported browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent storage abuse
- Input sanitization for file names
- Base64 encoding for secure storage
- No external dependencies for file processing
