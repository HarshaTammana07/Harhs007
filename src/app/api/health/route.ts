import { NextResponse } from "next/server";
import { ApiService } from "@/services/ApiService";

export async function GET() {
  try {
    // Test database connection by trying to fetch family members
    const startTime = Date.now();
    await ApiService.getFamilyMembers();
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      responseTime: `${responseTime}ms`,
      services: {
        supabase: "operational",
        apiService: "operational"
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      services: {
        supabase: "error",
        apiService: "error"
      }
    }, { status: 500 });
  }
}