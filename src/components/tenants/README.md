# Tenant Management System

A complete tenant management system with property assignment and full CRUD operations.

## Components

### TenantManagement
The main component that provides a complete tenant management interface with:
- List view of all tenants with search functionality
- Statistics overview (total tenants, active tenants, total rent)
- Add, edit, and delete operations
- Responsive card-based layout
- Property assignment information display

### EnhancedTenantForm
An advanced form for creating and editing tenants with property assignment:
- Basic Information: Full name, phone, email, occupation
- Property Assignment: Property type, building, apartment/flat selection
- Rental Details: Agreement number, monthly rent, security deposit, dates
- Smart features: Auto-fill rent from property, occupancy updates
- Comprehensive validation and error handling

### MinimalTenantForm
A streamlined form for creating and editing tenants with only essential fields:
- Basic Information: Full name, phone, email, occupation
- Rental Details: Agreement number, monthly rent, security deposit, dates
- Minimal validation and error handling

## Features

✅ **Complete CRUD Operations**
- Create new tenants with property assignment
- Read/view tenant list and details
- Update existing tenant information
- Delete tenants with confirmation and property cleanup

✅ **Property Assignment**
- Choose property type (Building/Flat)
- Select specific building from dropdown
- Choose apartment within selected building
- Select standalone flat
- Auto-fill rent amount from selected property
- Show property occupancy status

✅ **Smart Property Management**
- Automatically mark property as occupied when tenant assigned
- Free up property when tenant is deleted
- Display property information in tenant cards
- Prevent double-booking with occupancy indicators

✅ **Search & Filter**
- Search by name, phone, or occupation
- Real-time filtering

✅ **Statistics Dashboard**
- Total tenants count
- Active tenants count
- Total monthly rent calculation

✅ **Responsive Design**
- Works on desktop, tablet, and mobile
- Card-based layout for easy viewing

✅ **Database Integration**
- Uses Supabase for data persistence
- Proper error handling and loading states
- Automatic property occupancy updates

## Usage

### Basic Usage
```tsx
import { TenantManagement } from "@/components/tenants/TenantManagement";

export default function TenantsPage() {
  return <TenantManagement />;
}
```

### With Custom Layout
```tsx
import { TenantManagement } from "@/components/tenants/TenantManagement";
import { AppLayout } from "@/components/layout/AppLayout";

export default function TenantsPage() {
  return (
    <AppLayout>
      <TenantManagement />
    </AppLayout>
  );
}
```

### Using Enhanced Form Separately
```tsx
import { EnhancedTenantForm } from "@/components/tenants/EnhancedTenantForm";

function MyComponent() {
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = async (tenantData) => {
    // Handle tenant creation/update
  };

  return (
    <EnhancedTenantForm
      isOpen={showForm}
      onSubmit={handleSubmit}
      onCancel={() => setShowForm(false)}
      title="Add New Tenant"
    />
  );
}
```

## API Integration

The system uses the following services:
- `PropertyService.getTenants()` - Fetch all tenants
- `PropertyService.saveTenant()` - Create new tenant
- `PropertyService.updateTenant()` - Update existing tenant
- `PropertyService.deleteTenant()` - Delete tenant

## Data Model

The enhanced tenant form captures:
- **Personal Info**: Full name, occupation, phone, email
- **Property Assignment**: Property type, building selection, apartment/flat selection
- **Rental Agreement**: Agreement number, rent amount, security deposit, start/end dates

### Property Assignment Flow:
1. **Select Property Type**: Choose between "Building" or "Flat"
2. **Building Path**: Select building → Select apartment within building
3. **Flat Path**: Select standalone flat
4. **Auto-fill**: Rent amount automatically filled from selected property
5. **Occupancy Update**: Property marked as occupied when tenant assigned

All other tenant fields are populated with sensible defaults or inherited from existing data during updates.

## Testing

- Visit `/demo/tenant-management` to test the basic system
- Visit `/demo/enhanced-tenant-management` to test the complete system with property assignment
- Use the "Create Sample Properties" button to generate test buildings and flats
- Use the "Create Sample Tenant" button to generate test tenant data