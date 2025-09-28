"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types";
import {
  Button,
  Input,
  Card,
} from "@/components/ui";

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(credentials);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (error) clearError();
    };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 lg:py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/30"></div>

      <div className="max-w-4xl w-full relative z-10">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Logo and Branding */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 lg:p-8 flex flex-col justify-center items-center text-white">
                              <div className="text-center mb-6 lg:mb-8">
                  <div className="bg-white/20 rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 backdrop-blur-sm">
                    <div className="text-3xl lg:text-4xl font-black mb-2">SFS</div>
                    <div className="text-base lg:text-lg font-medium opacity-90">STORES</div>
                  </div>

                  <h1 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3">
                    Satyanarayana Fancy Stores
                  </h1>
                  <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 opacity-90">
                    Enterprise Asset Management Platform
                  </h2>
                  <p className="text-xs lg:text-sm opacity-80 leading-relaxed">
                    Comprehensive real estate portfolio management solution for
                    property tracking, tenant administration, financial oversight,
                    and regulatory compliance in one integrated platform.
                  </p>
                </div>

              <div className="text-center text-xs opacity-70">
                <p>© 2024 Satyanarayana Fancy Stores</p>
                <p>Enterprise Asset Management System</p>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8">
              <div className="max-w-sm mx-auto">
                <div className="text-center mb-6 lg:mb-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Welcome Back
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                    Sign in to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 lg:space-y-4">
                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      required
                      value={credentials.email}
                      onChange={handleInputChange("email")}
                      placeholder="Enter your email"
                    />

                    <div className="relative">
                      <Input
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={credentials.password}
                        onChange={handleInputChange("password")}
                        placeholder="Enter your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    Sign in
                  </Button>

                  <div className="text-center">
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      <p className="mb-2 font-medium">System Features:</p>
                      <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-700 p-2 lg:p-3 rounded-md">
                                               <p className="flex items-center justify-center space-x-1">
                         <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                         <span>Portfolio Management</span>
                       </p>
                       <p className="flex items-center justify-center space-x-1">
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                         <span>Financial Operations</span>
                       </p>
                       <p className="flex items-center justify-center space-x-1">
                         <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                         <span>Compliance & Documentation</span>
                       </p>
                       <p className="flex items-center justify-center space-x-1">
                         <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                         <span>Business Intelligence</span>
                       </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
