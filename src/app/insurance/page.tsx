import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { InsuranceManagement } from "@/components/insurance/InsuranceManagement";

export default function InsurancePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <InsuranceManagement />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
