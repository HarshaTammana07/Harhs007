# UI Components

This directory contains reusable UI components for the Family Business Management System.

## Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>;
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

### Input

A form input component with label, error, and helper text support.

```tsx
import { Input } from "@/components/ui";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Email is required"
  helperText="We'll never share your email"
/>;
```

**Props:**

- `label`: string
- `error`: string
- `helperText`: string
- All standard HTML input props

### Card

A flexible card component with header, content, and footer sections.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Modal

A modal dialog component using Headless UI.

```tsx
import { Modal } from "@/components/ui";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content</p>
</Modal>;
```

**Props:**

- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean

### Loading Components

#### LoadingSpinner

A simple spinning loader.

```tsx
import { LoadingSpinner } from "@/components/ui";

<LoadingSpinner size="md" />;
```

#### LoadingState

A full loading state with spinner and message.

```tsx
import { LoadingState } from "@/components/ui";

<LoadingState message="Loading data..." size="lg" />;
```

### Grid System

Responsive grid layout components.

```tsx
import { Grid, GridItem } from "@/components/ui";

<Grid cols={3} gap="md">
  <GridItem colSpan={2}>
    <div>Spans 2 columns</div>
  </GridItem>
  <GridItem>
    <div>Spans 1 column</div>
  </GridItem>
</Grid>;
```

**Grid Props:**

- `cols`: 1 | 2 | 3 | 4 | 5 | 6 | 12
- `gap`: 'sm' | 'md' | 'lg' | 'xl'

**GridItem Props:**

- `colSpan`: 1-12

### Container

A responsive container component.

```tsx
import { Container } from "@/components/ui";

<Container size="lg">
  <div>Centered content with max width</div>
</Container>;
```

**Props:**

- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'

### ErrorBoundary

A React error boundary component for graceful error handling.

```tsx
import { ErrorBoundary } from "@/components/ui";

<ErrorBoundary fallback={<div>Custom error UI</div>}>
  <YourComponent />
</ErrorBoundary>;
```

### Toaster

Toast notification system using react-hot-toast.

```tsx
import { Toaster } from "@/components/ui";
import toast from "react-hot-toast";

// Add to your app root
<Toaster />;

// Use anywhere in your app
toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
```

## Layout Components

### AppLayout

The main application layout with sidebar navigation and header.

```tsx
import { AppLayout } from "@/components/layout";

<AppLayout>
  <YourPageContent />
</AppLayout>;
```

### Header

Application header with branding and user info.

### Sidebar

Responsive sidebar navigation with mobile support.

## Styling

All components use Tailwind CSS for styling and are fully responsive. The design system follows these principles:

- **Consistent spacing**: Using Tailwind's spacing scale
- **Accessible colors**: WCAG compliant color combinations
- **Responsive design**: Mobile-first approach
- **Focus states**: Proper keyboard navigation support
- **Loading states**: Clear feedback for async operations

## Testing

Each component includes comprehensive tests covering:

- Rendering with different props
- User interactions
- Accessibility features
- Error states

Run tests with:

```bash
npm run test
```

## Customization

Components accept custom className props for additional styling:

```tsx
<Button className="custom-styles">Custom Button</Button>
```

The `cn` utility function merges Tailwind classes properly, handling conflicts and ensuring the final output is optimized.
