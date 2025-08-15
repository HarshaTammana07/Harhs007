# LocalStorageService

The `LocalStorageService` is a comprehensive service class that handles all localStorage operations for the Family Business Management System. It provides CRUD operations, data validation, error handling, storage quota monitoring, and data export/import functionality.

## Features

### ✅ CRUD Operations

- **Family Members**: Create, read, update, delete family member records
- **Properties**: Manage rental property information
- **Insurance Policies**: Handle insurance policy data
- **Documents**: Store and manage document metadata and Base64 file data

### ✅ Data Serialization and Deserialization

- Automatic handling of Date objects (converts to/from ISO strings)
- Nested object and array serialization
- Type-safe data retrieval

### ✅ Error Handling

- Custom `LocalStorageError` class with specific error codes
- Graceful handling of localStorage quota exceeded
- JSON parse error handling
- Data validation errors
- Storage availability checks

### ✅ Data Validation

- Required field validation for all data types
- Type-specific validation rules
- Import data structure validation

### ✅ Storage Quota Monitoring

- Real-time storage usage calculation
- Storage quota information (used, available, total, percentage)
- Per-data-type storage statistics
- Quota exceeded prevention

### ✅ Data Export/Import

- Complete data export to structured JSON
- Selective data import with validation
- Backup and restore functionality
- Version tracking for data compatibility

## Usage

### Basic Operations

```typescript
import { localStorageService } from "@/services/LocalStorageService";

// Family Member Operations
const member: FamilyMember = {
  id: "member-001",
  fullName: "John Doe",
  nickname: "John",
  // ... other properties
};

// Save
localStorageService.saveFamilyMember(member);

// Retrieve
const retrievedMember = localStorageService.getFamilyMemberById("member-001");

// Update
localStorageService.updateFamilyMember("member-001", { nickname: "Johnny" });

// Delete
localStorageService.deleteFamilyMember("member-001");

// Get all
const allMembers = localStorageService.getFamilyMembers();
```

### Storage Monitoring

```typescript
// Get storage quota information
const quota = localStorageService.getStorageQuota();
console.log(`Storage used: ${quota.percentage}%`);

// Get detailed storage stats
const stats = localStorageService.getStorageStats();
console.log("Storage by type:", stats);
```

### Data Export/Import

```typescript
// Export all data
const exportData = localStorageService.exportAllData();

// Export as JSON string
const jsonString = localStorageService.exportDataAsJSON();

// Import from JSON string
localStorageService.importAllData(jsonString);
```

### Error Handling

```typescript
import {
  LocalStorageError,
  LocalStorageErrorCodes,
} from "@/services/LocalStorageService";

try {
  localStorageService.saveFamilyMember(invalidMember);
} catch (error) {
  if (error instanceof LocalStorageError) {
    switch (error.code) {
      case LocalStorageErrorCodes.VALIDATION_ERROR:
        console.log("Validation failed:", error.message);
        break;
      case LocalStorageErrorCodes.QUOTA_EXCEEDED:
        console.log("Storage quota exceeded:", error.message);
        break;
      // Handle other error types...
    }
  }
}
```

## Error Codes

| Code                  | Description                          |
| --------------------- | ------------------------------------ |
| `QUOTA_EXCEEDED`      | localStorage quota has been exceeded |
| `PARSE_ERROR`         | JSON parsing failed                  |
| `VALIDATION_ERROR`    | Data validation failed               |
| `NOT_FOUND`           | Requested item not found             |
| `STORAGE_UNAVAILABLE` | localStorage is not available        |

## Data Models

The service works with the following TypeScript interfaces:

- `FamilyMember`: Family member information with profile photo and documents
- `RentalProperty`: Property details with tenant and rent history
- `InsurancePolicy`: Insurance policy information with premium history
- `Document`: Document metadata with Base64 file data

## Storage Keys

The service uses the following localStorage keys:

- `family_members`: Family member data
- `properties`: Rental property data
- `insurance_policies`: Insurance policy data
- `documents`: Document data
- `user_session`: User session data (used by AuthService)

## Performance Considerations

### Storage Optimization

- Base64 encoding for file storage (consider compression for large files)
- Efficient serialization/deserialization of Date objects
- Batch operations for multiple updates

### Memory Management

- Storage quota monitoring prevents browser crashes
- Graceful degradation when storage is full
- Cleanup utilities for old data

### Error Recovery

- Corrupted data handling (returns empty arrays)
- Automatic session cleanup on errors
- Import validation prevents data corruption

## Testing

The service includes comprehensive unit tests covering:

- All CRUD operations for each data type
- Date serialization/deserialization
- Error handling scenarios
- Storage quota management
- Data export/import functionality
- Validation logic

Run tests with:

```bash
npm test LocalStorageService.test.ts
```

## Browser Compatibility

The service is compatible with all modern browsers that support:

- localStorage API
- JSON.parse/stringify
- ES6+ features (classes, arrow functions, etc.)

## Security Considerations

- All data is stored locally in the browser
- No external data transmission
- Input validation prevents XSS attacks
- File data is Base64 encoded for safe storage

## Future Enhancements

Potential improvements for future versions:

1. **Compression**: Implement data compression for large files
2. **Encryption**: Add client-side encryption for sensitive data
3. **Sync**: Add cloud synchronization capabilities
4. **Indexing**: Implement search indexing for faster queries
5. **Caching**: Add intelligent caching for frequently accessed data

## Migration Path

The service is designed to be easily migrated to a database backend:

1. Replace localStorage operations with API calls
2. Maintain the same interface for seamless transition
3. Use the export/import functionality for data migration
4. Version tracking ensures data compatibility

## Examples

See `LocalStorageService.example.ts` for comprehensive usage examples including:

- Basic CRUD operations
- Storage monitoring
- Data export/import
- Error handling
- Real-world scenarios

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

- **7.1**: Data persistence with localStorage
- **7.2**: Automatic data saving and restoration
- **7.3**: Immediate localStorage updates on data modification
- **7.4**: JSON export functionality for backup
- **7.5**: JSON import functionality for data restoration
