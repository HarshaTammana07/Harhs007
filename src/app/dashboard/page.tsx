import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
