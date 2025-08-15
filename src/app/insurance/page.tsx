import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { InsuranceManagement } from "@/components/insurance/InsuranceManagement";

export default function InsurancePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <InsuranceManagement />
      </AppLayout>
    </ProtectedRoute>
  );
}
