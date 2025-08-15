import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  LoadingState,
  LoadingSpinner,
  Grid,
  GridItem,
  Container,
} from "@/components/ui";

export default function UIDemoPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              UI Components Demo
            </h1>
            <p className="text-gray-600 mt-1">
              Showcase of all available UI components in the system.
            </p>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Different button variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
              <CardDescription>Form input components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Name" placeholder="Enter your name" />
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                helperText="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password is required"
              />
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Card Layouts</CardTitle>
              <CardDescription>Different card configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={3} gap="md">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Simple Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This is a simple card with just content.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Card with Footer</CardTitle>
                    <CardDescription>
                      This card has a footer section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Card content goes here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metric Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">42</div>
                    <p className="text-sm text-gray-500">Total items</p>
                  </CardContent>
                </Card>
              </Grid>
            </CardContent>
          </Card>

          {/* Loading States */}
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Loading indicators and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
              <LoadingState message="Loading data..." />
            </CardContent>
          </Card>

          {/* Grid System */}
          <Card>
            <CardHeader>
              <CardTitle>Grid System</CardTitle>
              <CardDescription>Responsive grid layouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={4} gap="md">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-blue-100 p-4 rounded text-center">
                    Item {i + 1}
                  </div>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
