"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ThemeShowcase() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            🎨 Modern Dark Theme Showcase
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-300">
            Experience the beautiful, high-contrast dark theme with vibrant
            accents
          </p>
        </div>

        {/* Color Palette */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle>🌈 Color Palette</CardTitle>
            <CardDescription>
              Modern colors with perfect contrast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-primary-500 rounded-lg shadow-glow"></div>
                <p className="text-sm font-medium dark:text-white">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-green-500 rounded-lg"></div>
                <p className="text-sm font-medium dark:text-white">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-yellow-500 rounded-lg"></div>
                <p className="text-sm font-medium dark:text-white">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-red-500 rounded-lg"></div>
                <p className="text-sm font-medium dark:text-white">Error</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>🔘 Button Variants</CardTitle>
            <CardDescription>
              All button styles with hover effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="property-building">
            <CardHeader>
              <CardTitle>🏢 Buildings</CardTitle>
              <CardDescription>
                Apartment complexes and commercial buildings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Total: 5 buildings</p>
                <p className="text-sm">Occupied: 85%</p>
                <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="property-flat">
            <CardHeader>
              <CardTitle>🏠 Flats</CardTitle>
              <CardDescription>Individual residential units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Total: 12 flats</p>
                <p className="text-sm">Occupied: 92%</p>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="property-land">
            <CardHeader>
              <CardTitle>🌾 Land</CardTitle>
              <CardDescription>Agricultural and vacant land</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Total: 8 plots</p>
                <p className="text-sm">Utilized: 75%</p>
                <div className="w-full bg-yellow-200 dark:bg-yellow-900/30 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>🏷️ Status Badges</CardTitle>
            <CardDescription>Different status indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <span className="status-active px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
              <span className="status-inactive px-3 py-1 rounded-full text-sm font-medium">
                Inactive
              </span>
              <span className="status-warning px-3 py-1 rounded-full text-sm font-medium">
                Warning
              </span>
              <span className="status-error px-3 py-1 rounded-full text-sm font-medium">
                Error
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Form Elements</CardTitle>
            <CardDescription>Input fields with proper contrast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Property Name"
                placeholder="Enter property name"
                helperText="This will be displayed on reports"
              />
              <Input
                label="Monthly Rent"
                type="number"
                placeholder="0.00"
                helperText="Amount in your local currency"
              />
              <Input
                label="Tenant Email"
                type="email"
                placeholder="tenant@example.com"
              />
              <Input
                label="Error Example"
                placeholder="This field has an error"
                error="This field is required"
              />
            </div>
          </CardContent>
        </Card>

        {/* Glass Effect Card */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>✨ Glass Effect</CardTitle>
            <CardDescription>Modern glassmorphism design</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="dark:text-white">
              This card uses a glass effect with backdrop blur for a modern,
              elegant appearance. The transparency and blur create depth while
              maintaining readability.
            </p>
          </CardContent>
        </Card>

        {/* Dark Theme Features */}
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="dark-text-primary">
              🌙 Dark Theme Features
            </CardTitle>
            <CardDescription className="dark-text-secondary">
              What makes this dark theme special
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold dark-text-primary">
                  High Contrast
                </h4>
                <p className="text-sm dark-text-secondary">
                  Perfect contrast ratios for accessibility and readability
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold dark-text-primary">
                  Vibrant Accents
                </h4>
                <p className="text-sm dark-text-secondary">
                  Colorful highlights that pop against the dark background
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold dark-text-primary">
                  Modern Colors
                </h4>
                <p className="text-sm dark-text-secondary">
                  Using zinc/gray palette for sophisticated depth
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold dark-text-primary">
                  Smooth Animations
                </h4>
                <p className="text-sm dark-text-secondary">
                  Subtle transitions and hover effects for polish
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation Examples */}
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>🎬 Animations</CardTitle>
            <CardDescription>Smooth transitions and effects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="animate-slide-up p-4 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <p className="font-medium dark:text-white">Slide Up</p>
                <p className="text-sm dark:text-zinc-300">
                  Smooth entrance animation
                </p>
              </div>
              <div className="animate-scale-in p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <p className="font-medium dark:text-white">Scale In</p>
                <p className="text-sm dark:text-zinc-300">
                  Gentle scaling effect
                </p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg hover:scale-105 transition-transform">
                <p className="font-medium dark:text-white">Hover Scale</p>
                <p className="text-sm dark:text-zinc-300">
                  Interactive hover effect
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
